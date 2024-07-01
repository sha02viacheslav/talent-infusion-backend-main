import { Module, forwardRef } from '@nestjs/common';
import { InvitationService } from './invitations.service';
import { InvitationController } from './invitations.controller';
import { InvitationSchema } from './invitations.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Invitation", schema: InvitationSchema }]),
    forwardRef(() => UserModule),
  ],
  controllers: [InvitationController],
  providers: [InvitationService],
  exports: [InvitationService],
})
export class InvitationModule {}
