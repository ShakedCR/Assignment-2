const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
   title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
  sender: {
      type: String,
      required: true,
    },
});
const postsModel = mongoose.model('post', postSchema);

module.exports = postsModel;