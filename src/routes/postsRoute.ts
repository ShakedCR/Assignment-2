import express from "express";
import postsController from "../controllers/postsController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.get('/', postsController.getAllPosts);
router.get('/:id', postsController.getPostById);
router.post('/', postsController.createPost);
router.delete('/:id', postsController.deletePost);
router.delete('/', postsController.deleteAllPosts);
router.put('/:id', postsController.updatePost);  


module.exports = router;

