import commentModel from "../models/commentModel";
import { Request, Response } from "express";
import baseController from "./baseController";
import { AuthRequest } from "../middleware/authMiddleware";

class CommentsController extends baseController {
    constructor() {
        super(commentModel);
    }

    // Override create method to associate comment with authenticated user
    async create(req: AuthRequest, res: Response) {
        if (req.user) {
            req.body.userId = req.user._id; // Associate comment with user ID from token
        }
        return super.create(req, res);
    }

    // Override DELETE to ensure only creator can delete
    async del(req: AuthRequest, res: Response) {
        const id = req.params.id;
        try {
            const comment = await this.model.findById(id);
            if (!comment) {
                res.status(404).send("Comment not found");
                return;
            }
            // Check if the authenticated user is the creator of the comment
            if (req.user && comment.userId.toString() === req.user._id) {
                super.del(req, res);
                return;
            } else {
                res.status(403).send("Forbidden: You are not the creator of this comment");
                return;
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Error deleting comment");
        }
    }

    // Override update to prevent changing userId and ensure ownership
    async update(req: AuthRequest, res: Response) {
        const id = req.params.id;
        try {
            const comment = await this.model.findById(id);
            if (!comment) {
                res.status(404).send("Comment not found");
                return;
            }
            // Check if the authenticated user is the creator of the comment
            if (!req.user || comment.userId.toString() !== req.user._id) {
                res.status(403).send("Forbidden: You are not the creator of this comment");
                return;
            }
            // Prevent changing userId field
            if (req.body.userId && req.body.userId !== comment.userId.toString()) {
                res.status(400).send("Cannot change creator of the comment");
                return;
            }
            super.update(req, res);
            return;
        } catch (err) {
            console.error(err);
            res.status(500).send("Error updating comment");
        }
    }
}

export default new CommentsController();