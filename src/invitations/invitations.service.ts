import { BadRequestException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Invitation, InviteeStatus } from './invitations.entity';
import { CreateInvitationDto, UpdateInvitationDto } from './invitations.dto';
import mongoose, { Model } from 'mongoose';
import { getFrontendConfig, getMailConfig } from "../config";
import { UserService } from '../users/users.service';
const mailConfig = getMailConfig();
const mailchimp = require('@mailchimp/mailchimp_transactional')(mailConfig.apiKey);
const frontendConfig = getFrontendConfig();
const MAX_INVITATIONS = 5;
@Injectable()
export class InvitationService {
  constructor(
      @InjectModel("Invitation")
      private readonly invitationModel: Model<Invitation>,
      @Inject(forwardRef(() => UserService))
      private readonly userService: UserService,
  ) {}

  async getByParentUserId(parent_user_id: string): Promise<Invitation[]> {
    return await this.invitationModel.find({
      parent_user_id
    });
  }


  async getById(id: string): Promise<Invitation> {
    return await this.invitationModel.findById(id);
  }


  async getByEmail(email:  string) {
    return await this.invitationModel.findOne({
      email: email.toLowerCase()
    })
  }

  async insertInvitation(createInvitationDto: CreateInvitationDto): Promise<Invitation | String>{
    const invitation = await this.getByEmail(createInvitationDto.email);
    if(invitation) {
      throw new BadRequestException(`User with email: ${createInvitationDto.email} already invited`)
    }
    const userExistOrNone = await this.userService.findByEmail(createInvitationDto.email);
    if(userExistOrNone) {
      throw new BadRequestException(`User with email: ${createInvitationDto.email} already exist`)  
    }
    const totalInvitations = (await this.getByParentUserId(createInvitationDto.parent_user_id)).length;
    if(totalInvitations >= MAX_INVITATIONS )  throw new BadRequestException(`Not more than 5 invitee allowed`)  
    const createdInvitation = new this.invitationModel({
      parent_user_id: createInvitationDto.parent_user_id,
      email: createInvitationDto.email.toLowerCase(),
      name: createInvitationDto.name,
      status:  InviteeStatus.PENDING
    })
    const invitationData = await createdInvitation.save();
    this.sendInvitationEmail(createInvitationDto.email.toLowerCase(), createInvitationDto.name);
    return invitationData;
  }

  async updateInvitation(
    invitation: Partial<UpdateInvitationDto>, 
    id: mongoose.Types.ObjectId | string
  ): Promise<Invitation> {
    return await this.invitationModel.findByIdAndUpdate(
      id,
      {
        ...invitation,
        updatedAt: new Date(),
      },
      {
        new: true,
      },
    );
  }

  async deleteInvitation(id: string): Promise<Invitation> {
    const deletedInvitee =  await this.invitationModel.findOneAndDelete({ _id: id });
    await this.userService.deleteUserByEmail(deletedInvitee.email);
    return deletedInvitee;
  }

  async sendInvitationEmail(email: string, name: string) {
    const message = {
      from_email: "noreply@talentinfusion.io",
      subject: "Invitation",
      to: [
        {
          email: email,
          type: "to",
          "name": name.replace(/(^\w|\s\w)/g, m => m.toUpperCase())
        }
      ],
      global_merge_vars: [
        {
          "name": "applink",
          "content": `${frontendConfig.url}/signup`
        }
      ]
    };
     mailchimp.messages.sendTemplate({
      template_name: "Talent Infusion - Invite a child",
      template_content: [{}],
      message: message,
    });
  }

  async resendInvitation(id: string) {
    const invitee = await this.getById(id);
    this.sendInvitationEmail(invitee.email, invitee.name);
  }
}
