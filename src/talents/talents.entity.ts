import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";

@Schema()
export class Talent {
  _id!: mongoose.Types.ObjectId;
  @Prop({
    required: false,
  })
  public name: string;
  @Prop({
    required: true,
  })
  public email: string;
  @Prop({
    required: false,
  })
  public current_title: string;
  @Prop({
    required: false,
  })
  public level_of_study: string;
  @Prop({
    required: false,
  })
  state_of_residence: string;
  @Prop({
    required: false,
  })
  current_company: string;
  @Prop({
    required: false,
  })
  experience_level: string;
  @Prop({
    required: false,
  })
  area_of_work: string;
  @Prop({
    required: false,
  })
  interested_in_relocation: string;
  @Prop({
    required: false,
  })
  linkedIn: string;
  @Prop({
    required: false,
  })
  download_link: string;
  @Prop({
    required: true,
    default: Date.now,
  })
  created_at: Date;
  @Prop({
    required: true,
    default: Date.now,
  })
  updated_at: Date;
}

export const TalentSchema = SchemaFactory.createForClass(Talent);


