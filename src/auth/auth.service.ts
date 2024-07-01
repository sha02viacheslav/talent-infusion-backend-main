import { forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Payload } from "../types/payload";
import { sign } from "jsonwebtoken";
import { UserService } from "../users/users.service";
import { getJWTConfig, getMailConfig } from "../config";
import { v4 as uuidv4 } from 'uuid';
import { first } from "rxjs";
const mailConfig = getMailConfig();
const mailchimp = require('@mailchimp/mailchimp_transactional')(mailConfig.apiKey);
const jwtConfig = getJWTConfig();

@Injectable()
export class AuthService {

  private readonly codeLength: number = 6;
  private readonly codeExpirationMinutes: number = 5;

  private verificationCodes: Map<string, {code: string; expiration: Date}> = new Map<string, { code: string; expiration: Date }>();

  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService
  ) {} 

  async signPayload(payload: Payload) {
    return sign(payload, jwtConfig.secretkey, { expiresIn: "7d" });
  }

  async validateUser(payload: Payload) {
    return await this.userService.findByPayload(payload);
  }

  async changeTokenforResetPassword(email: string, isSet: boolean): Promise<string> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = uuidv4();
    user.resetPasswordToken = isSet ? token : undefined;
    user.resetPasswordExpires = isSet ? Date.now() + 600000 : undefined; // Token expires in 10 mins
    await user.save();

    return token;
  }

  async sendResetPasswordEmailFromMailChimp(name:string, email: string, token: string, confirmed: boolean) {
    try {
      const message = {
        from_email: "noreply@talentinfusion.io",
        from_name: "Blavity Support",
        subject: confirmed ? "Reset Password Confirmation" : "Verification Code Sent - Action Required",
        to: [
          {
            email: email,
            type: "to"
          }
        ],
        global_merge_vars: [
          {
            name: "fullname",
            content: name,
          },
          ...(confirmed
            ? []
            : [
                {
                  name: "verificationcode",
                  content: token,
                },
              ]),
        ]
      };
      await mailchimp.messages.sendTemplate({
        template_name: confirmed ? "Talent Infusion - Reset Password Confirmation" : "Talent Infusion - Reset Password Link Email",
        template_content: [{}],
        message: message,
      });
    } catch (error) {
      throw new NotFoundException('Raised issue during sending an email');
    }
  }

  async generateVerificationCode(): Promise<string> {
    const verificationCode = await Math.floor(Math.random() * Math.pow(10, this.codeLength)).toString();
    return verificationCode;
  }

  async checkVerificationCode(email: string, code: string): Promise<number> {
    const verificationData = this.verificationCodes.get(email);
    if (!verificationData) return -1;

    const {code: storedCode, expiration} = verificationData;

    if (expiration < new Date()) {
      this.verificationCodes.delete(email);
      return 0;
    }

    return code === storedCode ? 1 : -1;
  }

  async updateVerificationCodes(email: string, verificationCode: string): Promise<boolean> {
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + this.codeExpirationMinutes);

    this.verificationCodes.set(email, { code: verificationCode, expiration });

    return true;
  }

  capitalizeString(input: string): string {
    return input.replace(/\b\w/g, (match) => match.toUpperCase());;
  }

  getFullName(firstName: string, lastName: string): string {
    if (firstName && lastName) return this.capitalizeString((firstName + ' ' + lastName));
    return 'Talent Infusion User';
  }

  async resendVerificationCode(email: string): Promise<boolean> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return false;
    }
    const verificationCode = await this.generateVerificationCode();
    await this.updateVerificationCodes(email, verificationCode);

    const fullName = this.getFullName(user.first_name, user.last_name);
    await this.sendResetPasswordEmailFromMailChimp(fullName, email, verificationCode, false);

    return true;
  }

  async sendResetPasswordEmail(email: string): Promise<boolean> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const verificationCode = await this.generateVerificationCode();
    await this.updateVerificationCodes(email, verificationCode);

    const fullName = this.getFullName(user.first_name, user.last_name);
    await this.sendResetPasswordEmailFromMailChimp(fullName, email, verificationCode, false);

    return true;
  }

  async validateResetPasswordCode(email: string, token: string) {
    const user = await this.userService.findByResetTokens(email, token);

    if (!user) {
      throw new NotFoundException('Invalid or expired token');
    }

    return user;
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    const user = await this.validateResetPasswordCode(email, token);
    if (!user) {
      return false;
    }
    
    user.password = newPassword;
    await user.save();
    const fullName = this.getFullName(user.first_name, user.last_name);
    await this.sendResetPasswordEmailFromMailChimp(fullName, user.email, email, true);

    return true;
  }
}
