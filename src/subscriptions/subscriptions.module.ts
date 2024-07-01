import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { UserModule } from '../users/users.module';
import { SubscriptionController } from './subscriptions.controller';
import { SubscriptionSchema } from './subscriptions.entity';
import { SubscriptionService } from './subscriptions.services';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Subscription", schema: SubscriptionSchema }]),
    UserModule
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
