import { IsObject, IsString } from 'class-validator';

export class CreateCheckoutSession {
  @IsString()
  userId: string;
  @IsString()
  productId: string;
  @IsString()
  tryAgain: boolean;
}

export class CreatePortalSession {
  @IsString()
  userId: string;
}


export class CreatePaymentDto {
  @IsObject()
  userId: string;
  @IsString()
  checkoutSessionId: string;
}


