import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { User } from "../users/users.entity";


export enum InviteeStatus {
  ACTIVE = 'active',
  PENDING = 'pending'
}


@Schema()
export class Invitation {
  _id!: mongoose.Types.ObjectId;
  @Prop({
    required: true,
  })
  public email: string;
  @Prop({
    required: true,
  })
  public name: string;
  @Prop({
    ref: () => User,
  })
  public parent_user_id: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    enum: InviteeStatus,
  })
  public status: InviteeStatus;

  @Prop({
    required: true,
    default: Date.now,
  })
  createdAt: Date;
  @Prop({
    required: true,
    default: Date.now,
  })
  updatedAt: Date;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);