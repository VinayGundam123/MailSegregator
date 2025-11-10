import mongoose, { Schema, Document } from "mongoose";

export interface IAccount extends Document {
  email: string;
  password: string;
  imapHost: string;
  imapPort: number;
  smtpHost?: string;
  smtpPort?: number;
  name?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    imapHost: { type: String, required: true },
    imapPort: { type: Number, required: true, default: 993 },
    smtpHost: { type: String },
    smtpPort: { type: Number, default: 587 },
    name: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Account = mongoose.model<IAccount>("Account", AccountSchema);
