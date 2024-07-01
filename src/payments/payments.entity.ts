import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '../users/users.entity';
import mongoose from 'mongoose';

export enum PaymentStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
  OPEN = 'open'
}

@Schema()
export class Payment {
  _id!: mongoose.Types.ObjectId;
  @ApiProperty({
    description: 'user object Id',
    example: '5bf142459b72e12b2b1b2cd',
  })
  @Prop({
    ref: () => User,
  })
  public userId: mongoose.Types.ObjectId;
  @Prop({
    required: false,
  })
  public sessionId: string;
  @Prop({
    required: false,
  })
  public intentId: string;
  @Prop({
    required: true,
    enum: PaymentStatus,
  })
  public status: PaymentStatus;
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



export const PaymentSchema = SchemaFactory.createForClass(Payment);