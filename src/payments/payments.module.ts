import { Module } from '@nestjs/common';
import { PaymentService } from './payments.service';
import { PaymentController } from './payments.controller';
import { Payment, PaymentSchema } from './payments.entity';
import { UserModule } from '../users/users.module';
import { SubscriptionModule } from 'src/subscriptions/subscriptions.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Payment", schema: PaymentSchema }]),
    UserModule,
    SubscriptionModule
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
