import commentModel from "../models/commentModel";
import { Request, Response } from "express";
import baseController from "./baseController";
import { AuthRequest } from "../middleware/authMiddleware";

class CommentsController extends baseController {
  constructor() {
    super(commentModel);
  }

  async create(req: AuthRequest, res: Response) {
    if (req.user) {
      req.body.userId = req.user._id;
    }
    return super.create(req, res);
  }

  async del(req: AuthRequest, res: Response) {
    const id = req.params.id;

    try {
      const comment = await this.model.findById(id);
      if (!comment) {
        res.status(404).send("Comment not found");
        return;
      }

      if (req.user && comment.userId.toString() === req.user._id) {
        super.del(req, res);
        return;
      } else {
        res
          .status(403)
          .send("Forbidden: You are not the creator of this comment");
        return;
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Error deleting comment");
    }
  }

  async update(req: AuthRequest, res: Response) {
    const id = req.params.id;

    try {
      const comment = await this.model.findById(id);
      if (!comment) {
        res.status(404).send("Comment not found");
        return;
      }

      if (!req.user || comment.userId.toString() !== req.user._id) {
        res
          .status(403)
          .send("Forbidden: You are not the creator of this comment");
        return;
      }

      if (
        req.body.userId &&
        req.body.userId !== comment.userId.toString()
      ) {
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
