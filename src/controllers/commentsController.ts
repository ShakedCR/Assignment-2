const commentModel = require('../models/commentsModel');


const getAllComments = async (req, res) => {
  try {
    const postFilter = req.query.post;
    let comments;

    if (postFilter) {
      comments = await commentModel.find({ post: postFilter });
    } else {
      comments = await commentModel.find();
    }

    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving comments");
  }
};


const getCommentById = async (req, res) => {
  const id = req.params.id;
  try {
    const comment = await commentModel.findById(id);
    res.json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving comment by ID");
  }
};


const createComment = async (req, res) => {
  const commentData = req.body;
  try {
    const newComment = new commentModel(commentData);
    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating comment");
  }
};


const deleteComment = async (req, res) => {
  const id = req.params.id;
  try {
    const deletedComment = await commentModel.findByIdAndDelete(id);
    res.status(200).json(deletedComment);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting comment");
  }
};



const updateComment = async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;
  try {
    const updatedComment = await commentModel.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );
    res.json(updatedComment);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating comment");
  }
};

module.exports = {
  getAllComments,
  getCommentById,
  createComment,
  deleteComment,
  updateComment,
};
