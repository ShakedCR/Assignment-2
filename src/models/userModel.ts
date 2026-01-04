
import mongoose, { Schema } from "mongoose";

export interface User {
  username: string;
  email: string;
  password: string;
  refreshTokens: string[];
}

const userSchema = new Schema<User>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    refreshTokens: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<User>("User", userSchema);
