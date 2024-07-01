import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { User, UserType } from "./users.entity";
import { SanitizeUser } from "../types/users";
import { CreateUserDto, UpdateUserDto } from "./users.dto";
import { LoginDTO } from "src/auth/login.dto";
import * as bcrypt from "bcrypt";
import { Payload } from "../types/payload";
import { AuthService } from "../auth/auth.service";
import { InvitationService } from "../invitations/invitations.service";
import { InviteeStatus } from "../invitations/invitations.entity";
import { getMailConfig } from "../config";
const mailConfig = getMailConfig();
const mailchimp = require('@mailchimp/mailchimp_transactional')(mailConfig.apiKey);

@Injectable()
export class UserService {
  constructor(
    @InjectModel("User") 
    private userModel: Model<User>,
    private authService: AuthService,
    @Inject(forwardRef(() => InvitationService))
    private invitationService: InvitationService
  ) {}

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    return user;
  }

  async findByResetTokens(email: string, token: string): Promise<User> {
    const user = await this.userModel.findOne({ 
      email,
      resetPasswordCode: token,
      resetPasswordExpires: { $gt: Date.now() }, 
    });
    return user;
  }

  async findAllUsers(): Promise<User[]> {
    return await this.userModel.find();
  }

  async findByParentUserId(parent_user_id: string | mongoose.Types.ObjectId): Promise<User[]> {
    return await this.userModel.find({
      parent_user_id
    });
  }

  async create(createUserDto: CreateUserDto) {
    const { email } = createUserDto;
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (user) {
      throw new HttpException("user already exists", HttpStatus.BAD_REQUEST);
    }
    const isGuest = await this.isGuest(email);
    if(isGuest) {
      const parentUser = await this.userModel.findById(isGuest.parent_user_id)
      const createdUser = new this.userModel({
          ...createUserDto,
          parent_user_id: parentUser._id,
          boss_mode: parentUser.boss_mode,
          is_child: true,
          user_type: UserType.CHILD,
          email: email.toLowerCase(),
          company_name: parentUser.company_name
      });
      await createdUser.save();
      await this.invitationService.updateInvitation({
        status: InviteeStatus.ACTIVE
      },isGuest._id)
      this.sendWelcomeEmail(email);
      return this.sanitizeUser(createdUser);
    }
    else {
      const createdUser = new this.userModel({
          ...createUserDto,
          is_child: false,
          user_type: UserType.PARENT,
          email: email.toLowerCase(),
      });
      await createdUser.save();
      this.sendWelcomeEmail(email);
      return this.sanitizeUser(createdUser);
    }

  }

  async findByLogin(UserDTO: LoginDTO) {
    const { email, password } = UserDTO;
    try {
      const user = await this.userModel.findOne({ email: email.toLowerCase()});
      if(!user || user  == null) {
        throw new HttpException(`User with provided email donot Exist`, HttpStatus.BAD_REQUEST);
      }
      
      if (!password) {
        throw new HttpException("invalid credential", HttpStatus.BAD_REQUEST);
      }
      try {
        const match = await bcrypt.compare(password, user.password)
        if (match) {
          return this.sanitizeUser(user);
        } else {
          throw new HttpException("invalid credential", HttpStatus.BAD_REQUEST);
        }
      }
      catch (e) {
        throw new HttpException(e, HttpStatus.BAD_REQUEST);
      }  
    } catch (error) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
    } 
  }

  sanitizeUser(user: SanitizeUser) {
    const sanitized = user.toObject();
    delete sanitized["password"];
    return sanitized;
  }

  async findByPayload(payload: Payload) {
    const { email } = payload;
    return await this.userModel.findOne({ email: email.toLowerCase() });
  }

  async updateUser(
    user: Partial<UpdateUserDto>,
    id: mongoose.Types.ObjectId | string
  ) {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      {
        ...user,
        updatedAt: new Date(),
      },
      {
        new: true,
      }
    );
    const payload = { 
      email: updatedUser.email.toLowerCase(), 
      firstName: updatedUser.first_name, 
      lastName: updatedUser.last_name,
      companyName: updatedUser.company_name,
      photo: updatedUser.photo,
      bossMode: user.boss_mode ? user.boss_mode : false,
      id: updatedUser._id
    };
    if(updatedUser.company_name) {
       const childUsers = await this.findByParentUserId(updatedUser._id);
       if( childUsers.length ) {
          childUsers.map(async a => {
            await this.userModel.findByIdAndUpdate(
              a._id,
              {
                company_name: updatedUser.company_name,
                updatedAt: new Date(),
              }
            );
          })
        }
    }
    const token = await this.authService.signPayload(payload);
    return { updatedUser, token };
  }

  async updateUserByEmail(
    user: Partial<UpdateUserDto>, 
    email: string
  ): Promise<User> {
    const id = (await this.findByEmail(email))._id;
    return await this.userModel.findByIdAndUpdate(
      id,
      {
        ...user,
        updatedAt: new Date(),
      },
      {
        new: true,
      },
    );
  }

  async getById(id: string): Promise<User[]> {

      return await this.userModel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        let: { userId: "$_id" },
        pipeline: [
          { 
            $match: { $expr: { $and: [
           { $eq: ["$$userId", "$userId"] },
           { $eq: [ "$status", "active"]},
          ]},
         } 
      }],
      as: "subscriptions"
      }
    }
    ]);
  }

  async deleteUser(id: string): Promise<User> {
    return await this.userModel.findOneAndDelete({ _id: id });
  }

  async deleteUserByEmail(email: string): Promise<User> {
    return await this.userModel.findOneAndDelete({ email: email });
  }


  async findByStripeCustomerId(stripe_customer_id: string): Promise<User> {
    return await this.userModel.findOne({ stripe_customer_id });
  }

  async isGuest(email: string) {
   return await this.invitationService.getByEmail(email);
  }

  async findChild(id: string) {
    return await this.userModel.find({
      parent_user_id: id
    })
  }

  async sendWelcomeEmail(email: string) {
    const message = {
      from_email: "noreply@talentinfusion.io",
      subject: "Welcome To Talent Infusion",
      to: [
        {
          email: email,
          type: "to"
        }
      ],
    
    };
     mailchimp.messages.sendTemplate({
      template_name: "Talent Infusion Welcome",
      template_content: [{}],
      message: message,
    });
  }
}
