import postModel from "../models/postModel";
import { Request, Response } from "express";
import baseController from "./baseController";
import { AuthRequest } from "../middleware/authMiddleware";

class PostsController extends baseController {
  constructor() {
    super(postModel);
  }

  async create(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthRequest;

    if (authReq.user) {
      (req as any).body.createdBy = authReq.user._id;
    }

    await super.create(req, res);
  }

  async del(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthRequest;
    const id = req.params.id;

    try {
      const post: any = await this.model.findById(id);
      if (!post) {
        res.status(404).send("Post not found");
        return;
      }

      const creatorId = post.createdBy?.toString?.();
      const userId = authReq.user?._id?.toString?.() ?? authReq.user?._id;

      if (userId && creatorId === userId) {
        await super.del(req, res);
        return;
      }

      res.status(403).send("Forbidden: You are not the creator of this post");
      return;
    } catch (err) {
      console.error(err);
      res.status(500).send("Error deleting post");
      return;
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthRequest;
    const id = req.params.id;

    try {
      const post: any = await this.model.findById(id);
      if (!post) {
        res.status(404).send("Post not found");
        return;
      }

      const creatorId = post.createdBy?.toString?.();
      const userId = authReq.user?._id?.toString?.() ?? authReq.user?._id;

      if (!userId || creatorId !== userId) {
        res.status(403).send("Forbidden: You are not the creator of this post");
        return;
      }

      if ((req as any).body?.createdBy && (req as any).body.createdBy.toString() !== creatorId) {
        res.status(400).send("Cannot change creator of the post");
        return;
      }

      (req as any).body.createdBy = creatorId;

      await super.update(req, res);
      return;
    } catch (err) {
      console.error(err);
      res.status(500).send("Error updating post");
      return;
    }
  }
}

export default new PostsController();
