const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');

router.get('/', postsController.getAllPosts);
router.get('/:id', postsController.getPostById);
router.post('/', postsController.createPost);
router.delete('/:id', postsController.deletePost);
router.delete('/', postsController.deleteAllPosts);
router.put('/:id', postsController.updatePost);  


module.exports = router;

