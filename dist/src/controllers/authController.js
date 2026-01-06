"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const sendError = (code, message, res) => {
    return res.status(code).json({ message });
};
const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined");
    }
    const tokenExpiresIn = process.env.JWT_EXPIRES_IN || "3600s";
    const refreshExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || "1440m";
    const token = jsonwebtoken_1.default.sign({ _id: userId }, secret, { expiresIn: tokenExpiresIn });
    const rand = Math.floor(Math.random() * 1000000);
    const refreshToken = jsonwebtoken_1.default.sign({ _id: userId, rand }, secret, { expiresIn: refreshExpiresIn });
    return { token, refreshToken };
};
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, username } = req.body;
    if (!email || !password) {
        return sendError(400, "Email and password are required", res);
    }
    try {
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        const user = yield userModel_1.default.create({
            email,
            password: hashedPassword,
            username,
            refreshTokens: [],
        });
        const tokens = generateToken(user._id.toString());
        user.refreshTokens.push(tokens.refreshToken);
        yield user.save();
        return res.status(201).json(Object.assign(Object.assign({}, tokens), { _id: user._id }));
    }
    catch (_a) {
        return sendError(500, "Internal server error", res);
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return sendError(400, "Email and password are required", res);
    }
    try {
        const user = yield userModel_1.default.findOne({ email }).select("+password");
        if (!user) {
            return sendError(401, "Invalid email or password", res);
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return sendError(401, "Invalid email or password", res);
        }
        const tokens = generateToken(user._id.toString());
        user.refreshTokens.push(tokens.refreshToken);
        yield user.save();
        return res.status(200).json(tokens);
    }
    catch (_a) {
        return sendError(500, "Internal server error", res);
    }
});
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return sendError(400, "Refresh token is required", res);
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return sendError(500, "JWT_SECRET is not defined", res);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, secret);
        const user = yield userModel_1.default.findById(decoded._id);
        if (!user) {
            return sendError(401, "Invalid refresh token", res);
        }
        if (!user.refreshTokens.includes(refreshToken)) {
            user.refreshTokens = [];
            yield user.save();
            return sendError(401, "Invalid refresh token", res);
        }
        const tokens = generateToken(user._id.toString());
        user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
        user.refreshTokens.push(tokens.refreshToken);
        yield user.save();
        return res.status(200).json(tokens);
    }
    catch (_a) {
        return sendError(401, "Invalid refresh token", res);
    }
});
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return sendError(400, "Refresh token is required", res);
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return sendError(500, "JWT_SECRET is not defined", res);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, secret);
        const user = yield userModel_1.default.findById(decoded._id);
        if (!user) {
            return sendError(401, "Invalid refresh token", res);
        }
        const before = user.refreshTokens.length;
        user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
        if (user.refreshTokens.length === before) {
            return sendError(401, "Invalid refresh token", res);
        }
        yield user.save();
        return res.status(200).json({ message: "Logged out successfully" });
    }
    catch (_a) {
        return sendError(401, "Invalid refresh token", res);
    }
});
exports.default = {
    register,
    login,
    refreshToken,
    logout,
};
//# sourceMappingURL=authController.js.map