
import {
    Controller,
    Get,
    BadRequestException,
    Delete,
    Param,
  } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { User } from 'src/users/users.entity';
import { Subscription } from './subscriptions.entity';
import { SubscriptionService } from './subscriptions.services';
  
  @Controller('subscription')
  export class SubscriptionController {
    constructor(private readonly subscriptionService: SubscriptionService) {}

    // @Get()
    // async getAll(
    // ): Promise<Subscription[]> {
    //   try {
    //     return await this.subscriptionService.getTodayQuestionCountOfSubscriber();
    //     // return await this.questionService.findAll(
    //     //   limit ? parseInt(limit) : 10,
    //     //   skip ? parseInt(skip) : 0,
    //     // );
    //   } catch (error) {
    //     throw new BadRequestException(error.message);
    //   }
    // }

    
    @Delete('/userId/:id')
    @ApiParam({
      name: 'id',
      required: true,
      description: 'User object Id',
    })
    async delete(@Param('id') id: string): Promise<User> {
      try {
        return await this.subscriptionService.cancelSubscription(id);
      } catch (err) {
        throw new BadRequestException(err.message);
      }
    }
  }

  