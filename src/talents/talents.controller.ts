import {
    Controller,
    Get,
    Param,
    Query,
    BadRequestException,
    Post,
    Body,
  } from '@nestjs/common';
  import { TalentService } from './talents.service';
  import { ApiBody, ApiQuery } from '@nestjs/swagger';
  import { Talent } from './talents.entity';
import { TalentsQuery } from './talents.dto';
  
  @Controller('talent')
  export class TalentController {
    constructor(private readonly talentService: TalentService) {}
    
    @Get('search')
    @ApiQuery({ name: 'name', required: true, description: 'enter any keywords' })
    @ApiQuery({ name: 'limit', required: false, description: 'limit' })
    @ApiQuery({ name: 'skip', required: false, description: 'skip' })
    async search(
      @Query()
      query: {
        name: string,
        area_of_work: string,
        title: string,
        limit: number;
        skip: number;
      },
    ) {
      try {
        return await this.talentService.search(
          query.name,
          query.area_of_work,
          query.title,
          query.skip,
          query.limit,
        );
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
    @Post('count_query')
    @ApiBody({ type: TalentsQuery })
    async countQuery(@Body() talentsQuery: TalentsQuery) {
      try {
        return await this.talentService.queryCount(
          talentsQuery.filterByFormula
        );
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
  }
  