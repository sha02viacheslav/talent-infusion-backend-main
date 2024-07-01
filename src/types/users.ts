import { Document } from "mongoose";

export interface SanitizeUser extends Document {
  email: string;
  password: string;
}
