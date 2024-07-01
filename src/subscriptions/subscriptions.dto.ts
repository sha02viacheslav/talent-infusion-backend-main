import { IsObject, IsString } from "class-validator";

export class CreateSubscriptionDto {
    @IsObject()
    userId: string;
    @IsString()
    stripe_subscription_id: string;
    @IsString()
    subscription_item_id: string;
    @IsString()
    cancel_at_period_end: string;
    @IsString()
    current_period_start: string;
    @IsString()
    current_period_end: string;
    @IsString()
    productId: string;
    @IsString()
    planId: string;
    @IsString()
    status: string;
    @IsString()
    recurring_type: string;
}

export class UpdateSubscriptionDto {
    @IsString()
    stripe_subscription_id: string; 
    @IsString()
    cancel_at_period_end?: string;
    @IsString()
    current_period_start?: string;
    @IsString()
    current_period_end?: string;
    @IsString()
    status?: string;
    @IsString()
    recurring_type?: string;
}