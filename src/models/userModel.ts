<<<<<<< HEAD

import mongoose, { Schema } from "mongoose";
=======
import mongoose from "mongoose";
>>>>>>> origin/main

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  refreshTokens: {
    type: [String],
    default: [],
  },
});

export default mongoose.model("user", userSchema);  