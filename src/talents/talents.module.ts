import { Module } from "@nestjs/common";
import { TalentService } from "./talents.service";
import { TalentController } from "./talents.controller";
import { TalentSchema } from "./talents.entity";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
  imports: [MongooseModule.forFeature([{ name: "Talent", schema: TalentSchema }])],
  controllers: [TalentController],
  providers: [TalentService],
  exports: [TalentService],
})
export class TalentModule {}
