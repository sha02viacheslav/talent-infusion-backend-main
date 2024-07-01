import { Injectable } from '@nestjs/common';
import { getStripeConfig } from 'src/config';
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from 'mongoose';
import { UpdateSubscriptionDto } from './subscriptions.dto';
import { Subscription } from './subscriptions.entity';
import { UserService } from 'src/users/users.service';
import { endOfDay, startOfDay, sub } from 'date-fns';
const stripeConfig = getStripeConfig();
const stripe = require('stripe')(stripeConfig.key);


@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel("Subscription")
    private readonly subscriptionModel: Model<Subscription>,
    private readonly userService: UserService
  ) {}


  async cancelSubscription(id: string) { 
    const subscription = await this.getByUserId(id);
    if(subscription) {
      return await stripe.subscriptions.update(
        subscription.stripe_subscription_id,
        { cancel_at_period_end: true }
      );
    }
  }

  async getByStripeSubscriptionIdFromStripe(id: string) {
    return await stripe.subscriptions.retrieve(id)
  }

  async getByStripeSubscriptionId(stripe_subscription_id: string) {
    return await this.subscriptionModel.findOne({
      stripe_subscription_id
    })
  }

  async getByUserId(userId: string): Promise<Subscription> {
    return await this.subscriptionModel.findOne({ 
     userId,
     status: "active"
    });
  }

  async getRemainingDays(subscription: Subscription) {
    return await this.subscriptionModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(subscription._id),
        },
      },
      {
        $addFields: {
          daysCount: {
            $round: {
              $divide: [
                {
                  $subtract: [
                    subscription.current_period_end,
                    subscription.createdAt
                  ]
                },
                86400000
              ]
            }
          }
        }
      }
    ])
  }

  async insertSubscription(subscriptionBody: any, stripeCustomerId: string): Promise<Subscription> {
    const subscription = await this.getByStripeSubscriptionId(subscriptionBody.id);
    if (subscription) {
      return await this.updateSubscription(subscriptionBody, subscription.id);
    }
     const user = await this.userService.findByStripeCustomerId(stripeCustomerId);
    await this.cancelOldSubscription(user._id.toString());
    await this.userService.updateUser({
      boss_mode: true
    }, user._id)
    const createdSubscription = new this.subscriptionModel({
      userId: user._id,
      stripe_subscription_id: subscriptionBody.id,
      current_period_start: subscriptionBody.current_period_start,
      current_period_end: subscriptionBody.current_period_end,
      productId: subscriptionBody.plan.product,
      planId: subscriptionBody.plan.id,
      subscription_item_id: subscriptionBody.items.data[0].id,
      recurring_type: subscriptionBody.items.data[0].price.recurring.interval,
      ...subscriptionBody
    });
    return await createdSubscription.save();
  }

  async updateBossMode(
    stripeSubscriptionBody: any,
    subscription: Subscription
  ) {
    const user = await this.userService.findByStripeCustomerId(stripeSubscriptionBody.customer);
    if(user) {
      const days = await this.getRemainingDays(subscription)
      if(days[0]?.daysCount > 0) {
        return await this.userService.updateUser({
          boss_mode: true
        },user._id)
      } else {
        await this.userService.updateUser({
          boss_mode: false
        },user._id)
      }
    }

  }


  async cancelOldSubscription(userId: string){
    return await this.subscriptionModel.updateMany({
      "userId": userId
    }, {
      "$set":{
        "status": "canceled"
     }});
  }
  
  async updateSubscription(
    subscriptionBody: UpdateSubscriptionDto,
    stripeSubscriptionId: string,
  ): Promise<Subscription> {
    const subscription = await this.getByStripeSubscriptionId(stripeSubscriptionId)
    if(subscription) {
      this.updateBossMode(subscriptionBody, subscription)
      return await this.subscriptionModel.findByIdAndUpdate(
        subscription._id,
        {
          status: subscriptionBody.status,
          cancel_at_period_end: subscriptionBody.cancel_at_period_end,
          current_period_start: subscriptionBody.current_period_start,
          current_period_end: subscriptionBody.current_period_end,
          updatedAt: new Date(),
        },
        {
          new: true,
        },
      );
    }
  }

  async getTodayQuestionCountOfSubscriber() {
    return await this.subscriptionModel.aggregate([
    {
      $match: {
        status: "active"
      }
    },
    {
      $lookup: {
        from: "questions",
        let: { userId: "$userId", createdAt: "$createdAt" },
        pipeline: [
          { 
            $match: { $expr: { $and: [
           { $eq: ["$$userId", "$userId"] },
           { $gte: [ "$createdAt", startOfDay(new Date())]},
           { $lt: ["$createdAt", endOfDay(new Date())] }
          ]},
         } 
      },
          {
            $group: {
              _id: "$userId",
              count: { $sum: 1 }
            }
          },
          {
            $project: {
              _id: 0,
              userId: "$_id",
              count: "$count"
            }
          }
        ],
        as: "questions"
      }
    },

  ])
}

}
