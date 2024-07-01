import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { User } from 'src/users/users.entity';

@Schema()
export class Subscription {
  @ApiHideProperty()
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
    required: true,
  })
  public stripe_subscription_id: string;
  @Prop({
    required: true,
  })
  public subscription_item_id: string;
  @Prop({
    required: false,
  })
  public cancel_at_period_end: boolean;
  @Prop({
    set: d => new Date(d * 1000),
    required: false,
  })
  public current_period_start: Date;
  @Prop({
    set: d => new Date(d * 1000),
    required: false,
  })
  public current_period_end: Date;
  @Prop({
    required: false,
  })
  public productId: string; 
  @Prop({
    required: false,
  })
  public planId: string;
  @Prop({
    required: false,
  })
  public status: string; 
  @Prop({
    required: false,
  })
  public recurring_type: string; 
  @ApiHideProperty()
  @Prop({
    required: true,
    default: Date.now,
  })
  createdAt: Date;
  @ApiHideProperty()
  @Prop({
    required: true,
    default: Date.now,
  })
  updatedAt: Date;
}


export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);