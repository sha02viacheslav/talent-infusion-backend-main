import {
    Controller,
    Post,
    Body,
    Headers,
    BadRequestException,
    Get,
    Delete,
    Param,
  } from '@nestjs/common';
  import { InvitationService } from './invitations.service';
  import { Invitation } from './invitations.entity';
  import { ApiBody, ApiParam } from '@nestjs/swagger';
  import { CreateInvitationDto } from './invitations.dto';
  import { ApiTags } from '@nestjs/swagger';
  
  @ApiTags('Invitation')
  @Controller('invitation')
  export class InvitationController {
    constructor(private readonly invitationService: InvitationService) {}
  

    @Get('/parent/:id')
    @ApiParam({
      name: 'id',
      required: true,
      description: 'Parent User object Id',
    })
    async getInviteesByParentUserId(@Param('id') id: string): Promise<Invitation[]> {
      try {
        return await this.invitationService.getByParentUserId(id);
      } catch (err) {
        throw new BadRequestException(err.message);
      }
    }


    @Post()
    @ApiBody({ type: CreateInvitationDto })
    async create(@Body() invitationBody: CreateInvitationDto): Promise<Invitation | String> {
      try {
        return await this.invitationService.insertInvitation(invitationBody);
      } catch (err) {
        throw new BadRequestException(err.message);
      }
    }
    

    @Post('resend/:id')
    @ApiParam({
      name: "id",
      required: true,
      description: "Invitee object Id",
    })
    async reSendInvitation(
      @Param("id") id: string,
    ): Promise<void> {
      try {
        return await this.invitationService.resendInvitation(id);
      } catch (err) {
        throw new BadRequestException(err.message);
      }
    }


    @Delete(':id')
    @ApiParam({
      name: 'id',
      required: true,
      description: 'User object Id',
    })
    async delete(@Param('id') id: string): Promise<Invitation> {
      try {
        return await this.invitationService.deleteInvitation(id);
      } catch (err) {
        throw new BadRequestException(err.message);
      }
    }
  
  }
  