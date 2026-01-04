const postModel = require('../models/postsModel');

const getAllPosts = async (req, res) => {
  try {
    const senderFilter = req.query.sender;
    let posts;
    if (senderFilter) {
      posts = await postModel.find({ sender: senderFilter });
    } else {
      posts = await postModel.find();
    }
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving posts");
  }
};

const getPostById = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await postModel.findById(id);
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving post by ID");
  }
};

const createPost = async (req, res) => {
  const postData = req.body;
  try {
    const newPost = new postModel(postData);
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating post");
  }
};

const deletePost = async (req, res) => {
  const id = req.params.id;
  try {
    const deletedPost = await postModel.findByIdAndDelete(id);
    res.status(200).json(deletedPost);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting post");
  }
};

const deleteAllPosts = async (req, res) => {
  try {
    await postModel.deleteMany({});
    res.status(200).send("All posts deleted");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting all posts");
  }
};

const updatePost = async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;
  try {
    const post = await postModel.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating post");
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  deletePost,
  deleteAllPosts,
  updatePost,
};