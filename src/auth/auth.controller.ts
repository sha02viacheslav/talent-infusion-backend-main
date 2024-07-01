import { Body, Controller, forwardRef, Get, HttpException, HttpStatus, Inject, Ip, NotFoundException, Param, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport/dist/auth.guard";
import { CreateUserDto } from "../users/users.dto";
import { UserService } from "../users/users.service";
import { AuthService } from "./auth.service";
import { LoginDTO } from "./login.dto";
import { ForgotPasswordDto, ResetPasswordDto, VerificationCodeDto } from "./auth.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post("register")
  async register(@Body() createUser: CreateUserDto) {
    const user = await this.userService.create(createUser);
    const payload = { 
      email: user.email.toLowerCase(), 
      firstName: user.first_name, 
      lastName: user.last_name,
      companyName: user.company_name,
      bossMode: user.boss_mode,
      userType: user.user_type,
      isChild: user.is_child,
      parentUserId: user.parent_user_id,
      id: user._id
    };
    const token = await this.authService.signPayload(payload);
    return { user, token };
  }

  @Post("login")
  async login(@Body() UserDTO: LoginDTO) {
    const user = await this.userService.findByLogin(UserDTO);
    const payload = { 
      email: user.email.toLowerCase(), 
      firstName: user.first_name, 
      lastName: user.last_name,
      companyName: user.company_name,
      photo: user.photo,
      bossMode: user.boss_mode ? user.boss_mode : false,
      userType: user.user_type,
      isChild: user.is_child,
      parentUserId: user.parent_user_id,
      id: user._id
    };
    const token = await this.authService.signPayload(payload);
    return { user, token };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const res = await this.authService.sendResetPasswordEmail(forgotPasswordDto.email);
    if (res) return {success: true, message: "Verification code sent successfully!"};
    return {success: false, message: "Raised issue while sending verification code"}
  }

  @Post('check-code') 
  async checkVerificationCode(@Body() verificaionCodeDto: VerificationCodeDto) {
    const isCodeValid = await this.authService.checkVerificationCode(verificaionCodeDto.email, verificaionCodeDto.code);

    if (isCodeValid === 1) {
      const token = await this.authService.changeTokenforResetPassword(verificaionCodeDto.email, true);
      return {success: true, token, message: 'Verification code is valid!'};
    }
    else if (isCodeValid === 0) { 
      return {success: false, message: 'Verification code expired.'};
    }

    return {success: false, message: 'Invalid verification code.'};
  }

  @Post('resend-code')
  async resendVerificationCode(@Body() resendCodeDto: ForgotPasswordDto) {
    const isCodeResent = await this.authService.resendVerificationCode(resendCodeDto.email);

    if (isCodeResent) {
      return {success: true, message: 'Verification code resent'};
    }

    return { success: false, message: 'Failed to resend the verification code'};
  }

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    const res = await this.authService.resetPassword(resetPasswordDto.email, resetPasswordDto.token, resetPasswordDto.password);
    if (!res) {
      throw new NotFoundException('User not found');
    }

    await this.authService.changeTokenforResetPassword(resetPasswordDto.email, false);
    return {success: true, message: 'Password reset successfully!'};
  }


  @Get("/onlyauth")
  @UseGuards(AuthGuard("jwt"))
  async hiddenInformation() {
    return "hidden information";
  }
}
