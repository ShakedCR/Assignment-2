import mongoose, { Schema, Types } from "mongoose";

export interface Post {
  title: string;
  content: string;
  createdBy: Types.ObjectId;
}

const postSchema = new Schema<Post>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const PostModel = mongoose.model<Post>("Post", postSchema);
