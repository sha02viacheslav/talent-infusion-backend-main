import { IsString } from "class-validator";

export class TalentsQuery {
    @IsString()
    filterByFormula: string;
  }
