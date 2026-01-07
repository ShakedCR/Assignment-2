import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";
import type { StringValue } from "ms";
import User from "../models/userModel";

const sendError = (code: number, message: string, res: Response) => {
  return res.status(code).json({ message });
};

type GeneratedTokens = {
  token: string;
  refreshToken: string;
};

const generateToken = (userId: string): GeneratedTokens => {
  const secret = process.env.JWT_SECRET as Secret;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const tokenExpiresIn: StringValue | number =
    (process.env.JWT_EXPIRES_IN as StringValue) || "3600s";

  const refreshExpiresIn: StringValue | number =
    (process.env.REFRESH_TOKEN_EXPIRES_IN as StringValue) || "1440m";

  const token = jwt.sign({ _id: userId }, secret, { expiresIn: tokenExpiresIn });

  const rand = Math.floor(Math.random() * 1_000_000);

  const refreshToken = jwt.sign({ _id: userId, rand }, secret, {
    expiresIn: refreshExpiresIn,
  });

  return { token, refreshToken };
};

const register = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  if (!email || !password) {
    return sendError(400, "Email and password are required", res);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      username,
      refreshTokens: [],
    });

    const tokens = generateToken(user._id.toString());
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    return res.status(201).json({
      ...tokens,
      _id: user._id,
    });
  } catch {
    return sendError(500, "Internal server error", res);
  }
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(400, "Email and password are required", res);
  }

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return sendError(401, "Invalid email or password", res);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(401, "Invalid email or password", res);
    }

    const tokens = generateToken(user._id.toString());
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    return res.status(200).json(tokens);
  } catch {
    return sendError(500, "Internal server error", res);
  }
};

const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return sendError(400, "Refresh token is required", res);
  }

  const secret = process.env.JWT_SECRET as Secret;
  if (!secret) {
    return sendError(500, "JWT_SECRET is not defined", res);
  }

  try {
    const decoded = jwt.verify(refreshToken, secret) as { _id: string };
    const user = await User.findById(decoded._id);

    if (!user) {
      return sendError(401, "Invalid refresh token", res);
    }

    if (!user.refreshTokens.includes(refreshToken)) {
      user.refreshTokens = [];
      await user.save();
      return sendError(401, "Invalid refresh token", res);
    }

    const tokens = generateToken(user._id.toString());

    user.refreshTokens = user.refreshTokens.filter((t: string) => t !== refreshToken);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    return res.status(200).json(tokens);
  } catch {
    return sendError(401, "Invalid refresh token", res);
  }
};

const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return sendError(400, "Refresh token is required", res);
  }

  const secret = process.env.JWT_SECRET as Secret;
  if (!secret) {
    return sendError(500, "JWT_SECRET is not defined", res);
  }

  try {
    const decoded = jwt.verify(refreshToken, secret) as { _id: string };
    const user = await User.findById(decoded._id);

    if (!user) {
      return sendError(401, "Invalid refresh token", res);
    }

    const before = user.refreshTokens.length;
    user.refreshTokens = user.refreshTokens.filter((t: string) => t !== refreshToken);

    if (user.refreshTokens.length === before) {
      return sendError(401, "Invalid refresh token", res);
    }

    await user.save();
    return res.status(200).json({ message: "Logged out successfully" });
  } catch {
    return sendError(401, "Invalid refresh token", res);
  }
};

export default {
  register,
  login,
  refreshToken,
  logout,
};
