import { IsBoolean, IsEnum, IsString } from "class-validator";
import { UserType } from "./users.entity";
export class CreateUserDto {
  @IsString()
  email: string;
  @IsString()
  password: string;
  @IsEnum(UserType)
  user_type: UserType;
  @IsBoolean()
  is_child: string;
  @IsBoolean()
  parent_id: string;

}

export class UpdateUserDto {
  @IsString()
  first_name?: string;
  @IsString()
  last_name?: string;
  @IsString()
  company_name?: string;
  @IsString()
  photo?: string;
  @IsString()
  stripe_customer_id: string;
  @IsString()
  stripe_checkout_session_id: string;
  @IsString()
  stripe_billing_portal_session_id: string;
  @IsString()
  boss_mode: boolean;
}
