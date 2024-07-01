import { IsEnum, IsString } from 'class-validator';
import { InviteeStatus } from './invitations.entity';

export class CreateInvitationDto {
  @IsString()
  email: string;
  @IsString()
  name: string;
  @IsString()
  parent_user_id: string;
  @IsEnum(InviteeStatus)
  status: string;
}


export class UpdateInvitationDto {
  @IsEnum(InviteeStatus)
  status: string;
}


