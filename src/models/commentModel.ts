import mongoose, { Schema, Types } from "mongoose";

export interface Comment {
  content: string;
  post: Types.ObjectId;
  user: Types.ObjectId;
}

const commentSchema = new Schema<Comment>(
  {
    content: {
      type: String,
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CommentModel = mongoose.model<Comment>(
  "Comment",
  commentSchema
);
