import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import UserModel from "../models/userModel";

class UsersController {
  async getAll(req: Request, res: Response) {
    try {
      const users = await UserModel.find().select("-password -refreshTokens");
      res.json(users);
    } catch {
      res.status(500).send("Error retrieving users");
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const user = await UserModel.findById(req.params.id).select("-password -refreshTokens");
      if (!user) {
        res.status(404).send("User not found");
        return;
      }
      res.json(user);
    } catch {
      res.status(500).send("Error retrieving user");
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        res.status(400).send("username, email and password are required");
        return;
      }

      const existing = await UserModel.findOne({
        $or: [{ username }, { email }],
      });

      if (existing) {
        res.status(409).send("User already exists");
        return;
      }

      const hashed = await bcrypt.hash(password, 10);

      const user = await UserModel.create({
        username,
        email,
        password: hashed,
        refreshTokens: [],
      });

      const safeUser = await UserModel.findById(user._id).select("-password -refreshTokens");
      res.status(201).json(safeUser);
    } catch {
      res.status(500).send("Error creating user");
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      const updateData: any = {};
      if (username !== undefined) updateData.username = username;
      if (email !== undefined) updateData.email = email;

      if (password !== undefined) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const updated = await UserModel.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).select("-password -refreshTokens");

      if (!updated) {
        res.status(404).send("User not found");
        return;
      }

      res.json(updated);
    } catch (err: any) {
      if (err?.code === 11000) {
        res.status(409).send("username/email already in use");
        return;
      }
      res.status(500).send("Error updating user");
    }
  }

  async del(req: Request, res: Response) {
    try {
      const deleted = await UserModel.findByIdAndDelete(req.params.id).select("-password -refreshTokens");
      if (!deleted) {
        res.status(404).send("User not found");
        return;
      }
      res.json({ message: "User deleted" });
    } catch {
      res.status(500).send("Error deleting user");
    }
  }
}

export default new UsersController();
