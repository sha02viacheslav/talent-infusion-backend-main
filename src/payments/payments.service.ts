import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Payment } from './payments.entity';
import { CreateCheckoutSession, CreatePortalSession } from './payments.dto';
import { getFrontendConfig, getServerConfig, getStripeConfig } from '../config';
import { UserService } from '../users/users.service';
import { Model, Types } from 'mongoose';
import { endOfMonth, startOfMonth } from 'date-fns';
import { SubscriptionService } from '../subscriptions/subscriptions.services';
const stripeConfig = getStripeConfig();
const serverConfig = getServerConfig();
const frontendConfig = getFrontendConfig();
const stripe = require('stripe')(stripeConfig.key);

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel("Payment")
    private readonly paymentModel: Model<Payment>,
    private readonly userService: UserService,
    private readonly subscriptionService: SubscriptionService
  ) {}


  async getByIntentId(intentId: string): Promise<Payment> {
    return await this.paymentModel.findOne({
      intentId
    });
  }

  async createPortalSession(portalSessionBody: CreatePortalSession) {
    const user = await this.userService.getById(portalSessionBody.userId);
    if(user){
      const checkoutSession = await this.retrieveCheckoutSession(
        user[0].stripe_checkout_session_id
      );
      return await stripe.billingPortal.sessions.create({
        customer: checkoutSession.customer,
        return_url: `${frontendConfig.url}/account/settings/payment-method`,
      });
    }
  }


 async retrieveCheckoutSession(checkoutSessionId: string) {
  return await stripe.checkout.sessions.retrieve(
    checkoutSessionId
  );
 }
 

 async isPaymentAlreadyMade(userId: Types.ObjectId | string) {
  return await this.paymentModel.find({
    userId,
    createdAt: {
      $gte: startOfMonth(new Date()),
      $lte: endOfMonth(new Date())
    }
  })
 }

  async createCheckoutSession(checkoutSessionBody: CreateCheckoutSession) {
    let success_url = `${frontendConfig.url}/signup?payment=success`;
    let cancel_url = `${frontendConfig.url}/signin?payment=failed`;
    if(checkoutSessionBody.tryAgain) {
      success_url = `${frontendConfig.url}/account/settings/payment-method?payment=success`;
      cancel_url =  `${frontendConfig.url}/account/settings/payment-method?payment=failed`;
    }
    const user = await this.userService.getById(checkoutSessionBody.userId);
    if (user) {
      const checkoutSession = await stripe.checkout.sessions.create({
        billing_address_collection: 'auto',
        customer_email: user[0].email.toLowerCase(),
        metadata: {
          user_id: checkoutSessionBody.userId,
        },
        
        client_reference_id: checkoutSessionBody.userId,
        line_items: [
          {
            price: checkoutSessionBody.productId,
            quantity: 1,
          },
        ],
        payment_method_types: ['card', 'us_bank_account'],
        allow_promotion_codes: true,
        mode: 'subscription',
        success_url: success_url,
        cancel_url: cancel_url
      });
      if(checkoutSession) {
        await this.userService.updateUser({
          stripe_checkout_session_id: checkoutSession.id
        }, user[0]._id);
      }
      return checkoutSession;
    }
    throw new BadRequestException(`user not found or userId is not correct`);

  }

  async insertPayment(webhookResponse: any): Promise<Payment | String>{
    const user = await this.userService.findByEmail(webhookResponse.customer_email);
    if(user) {
      const payment = await this.getByIntentId(webhookResponse.payment_intent);
      if(payment) return `Payment already made for this month`;
      const createdPayment = new this.paymentModel({
        userId: user._id,
        intentId: webhookResponse.payment_intent,
        status: webhookResponse.status,
      })
      return await createdPayment.save();
    }
    throw new BadRequestException(`User with email ${webhookResponse.customer_email} doesn't exist`)
  }


  async updatePayment(
    paymentBody
  ): Promise<Payment> {
    const payment = await this.getByIntentId(paymentBody.payment_intent)
    if(payment) {
      return await this.paymentModel.findByIdAndUpdate(
        payment._id,
        {
          paymentBody,
          updatedAt: new Date(),
        },
        {
          new: true,
        },
      );
    }
  }

  
  async verifyPayments(headers: any, body: any) {
    const sig = headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, stripeConfig.endPointSecret);
    } catch (err) {
      console.log(err);
      throw new BadRequestException(`Webhook Error: ${err}`)
    }
  
    switch (event.type) {
      case 'customer.created':
        await this.userService.updateUserByEmail({
          stripe_customer_id: event.data.object.id
        }, event.data.object.email)
        break;
      case 'customer.subscription.created':
        await this.subscriptionService.insertSubscription(
          event.data.object, 
          event.data.object.customer
        )
        break;
      case 'customer.subscription.updated':
        await this.subscriptionService.updateSubscription(
          event.data.object, 
          event.data.object.id
        )
        break;
      case 'customer.subscription.deleted':
          await this.subscriptionService.updateSubscription(
            event.data.object, 
            event.data.object.id
          )
          break;
      case 'invoice.payment_succeeded':
        await this.insertPayment(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.insertPayment(event.data.object);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    return "webhook done"

  }

  async deletePayment(id: string): Promise<Payment> {
    return await this.paymentModel.findOneAndDelete({ _id: id });
  }
}
