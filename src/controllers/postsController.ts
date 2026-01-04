import postModel from "../models/postsModel";
import { Request, Response } from "express";
import baseController from "./baseController";
import { AuthRequest } from "../middleware/authMiddleware";

class PostsController extends baseController {
    constructor() {
        super(postModel);
    }

    // Override create method to associate post with authenticated user
    async create(req: AuthRequest, res: Response) {
        if (req.user) {
            req.body.creatredBy = req.user._id; // Associate movie with user ID from token
        }
        return super.create(req, res);
    }

    //OVERRIDE DELETE to ensure only creator can delete
    async del(req: AuthRequest, res: Response) {
        const id = req.params.id;
        try {
            const post = await this.model.findById(id);
            if (!post) {
                res.status(404).send("Post not found");
                return;
            }
            // Check if the authenticated user is the creator of the post
            if (req.user && post.creatredBy.toString() === req.user._id) {
                super.del(req, res);
                return
            } else {
                res.status(403).send("Forbidden: You are not the creator of this movie");
                return;
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Error deleting post");
        }
    };

    //override put to prevent changing creatredBy
    async update(req: AuthRequest, res: Response) {
        const id = req.params.id;
        try {
            const post = await this.model.findById(id);
            if (!post) {
                res.status(404).send("Post not found");
                return;
            }
            // Prevent changing creatredBy field
            if (req.body.creatredBy && req.body.creatredBy !== post.creatredBy.toString()) {
                res.status(400).send("Cannot change creator of the post");
                return;
            }
            super.update(req, res);
            return;
        }
        catch (err) {
            console.error(err);
            res.status(500).send("Error updating post");
        }
    };
}

export default new PostsController();