import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { PaymentService } from './payments.service';
import { Payment } from './payments.entity';
import { ApiBody } from '@nestjs/swagger';
import { CreateCheckoutSession, CreatePaymentDto, CreatePortalSession } from './payments.dto';
import { ApiTags } from '@nestjs/swagger';
import { he } from 'date-fns/locale';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiBody({ type: CreatePaymentDto })
  async create(@Body() paymentBody: CreatePaymentDto): Promise<Payment | String> {
    try {
      return await this.paymentService.insertPayment(paymentBody);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Post("checkout-session")
  @ApiBody({ type: CreatePaymentDto })
  async createCheckoutSession(@Body() paymentBody: CreateCheckoutSession): Promise<Payment> {
    try {
      return await this.paymentService.createCheckoutSession(paymentBody);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Post("webhook")
  @ApiBody({ type: CreatePaymentDto })
  async verifyPayments(
    @Headers() headers: Headers,
    @Body() body: Buffer,
  ) {
    try {
      return await this.paymentService.verifyPayments(headers, body);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Post("create-portal-session")
  @ApiBody({ type: CreatePaymentDto })
  async createPortalSession(@Body() paymentBody: CreatePortalSession): Promise<Payment> {
    try {
      return await this.paymentService.createPortalSession(paymentBody);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
