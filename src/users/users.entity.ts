import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as bcrypt from "bcrypt";
import { Document } from 'mongoose';
import * as mongoose from "mongoose";

export enum UserType {
  PARENT = 'parent',
  CHILD = 'child',
  ADMIN = 'ading',
}

export type UserDocument = User & Document;

@Schema()
export class User extends Document {
  _id!: mongoose.Types.ObjectId;
  @Prop({
    required: true,
  })
  public email: string;
  @Prop({
    required: false,
  })
  public password: string;
  @Prop({
    required: false,
  })
  public first_name: string;
  @Prop({
    required: false,
  })
  public last_name: string;

  @Prop({
    required: false,
  })
  public company_name: string;


  @Prop({
    required: false,
  })
  public photo: string;


  @Prop({
    required: false,
    default: false,
  })
  public boss_mode: boolean;

  @Prop({
    required: false,
    enum: UserType,
  })
  public user_type: UserType;

  @Prop({
    required: false,
  })
  public parent_user_id: string;


  @Prop({
    default: false,
    required: true
  })
  public is_child: boolean;


  @Prop({
    required: false,
  })
  public stripe_customer_id: string;

  @Prop({
    required: false,
  })
  public stripe_checkout_session_id: string;

  @Prop({
    required: false,
  })
  public stripe_billing_portal_session_id: string;

  @Prop({
    required: true,
    default: Date.now,
  })
  created_at: Date;
  @Prop({
    required: true,
    default: Date.now,
  })
  updated_at: Date;
  @Prop({
    required: false,
    default: undefined,
  })
  resetPasswordToken: string;
  @Prop({
    required: false,
    default: undefined,
  })
  resetPasswordExpires: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre("save", async function (next: (err?: Error) => void) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    const hashed = await bcrypt.hash(this["password"], 10);
    this["password"] = hashed;
    return next();
  } catch (err) {
    return next(err);
  }
});
