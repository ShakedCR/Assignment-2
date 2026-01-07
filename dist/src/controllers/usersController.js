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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userModel_1 = __importDefault(require("../models/userModel"));
class UsersController {
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield userModel_1.default.find().select("-password -refreshTokens");
                res.json(users);
            }
            catch (_a) {
                res.status(500).send("Error retrieving users");
            }
        });
    }
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield userModel_1.default.findById(req.params.id).select("-password -refreshTokens");
                if (!user) {
                    res.status(404).send("User not found");
                    return;
                }
                res.json(user);
            }
            catch (_a) {
                res.status(500).send("Error retrieving user");
            }
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, email, password } = req.body;
                if (!username || !email || !password) {
                    res.status(400).send("username, email and password are required");
                    return;
                }
                const existing = yield userModel_1.default.findOne({
                    $or: [{ username }, { email }],
                });
                if (existing) {
                    res.status(409).send("User already exists");
                    return;
                }
                const hashed = yield bcryptjs_1.default.hash(password, 10);
                const user = yield userModel_1.default.create({
                    username,
                    email,
                    password: hashed,
                    refreshTokens: [],
                });
                const safeUser = yield userModel_1.default.findById(user._id).select("-password -refreshTokens");
                res.status(201).json(safeUser);
            }
            catch (_a) {
                res.status(500).send("Error creating user");
            }
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, email, password } = req.body;
                const updateData = {};
                if (username !== undefined)
                    updateData.username = username;
                if (email !== undefined)
                    updateData.email = email;
                if (password !== undefined) {
                    updateData.password = yield bcryptjs_1.default.hash(password, 10);
                }
                const updated = yield userModel_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select("-password -refreshTokens");
                if (!updated) {
                    res.status(404).send("User not found");
                    return;
                }
                res.json(updated);
            }
            catch (err) {
                if ((err === null || err === void 0 ? void 0 : err.code) === 11000) {
                    res.status(409).send("username/email already in use");
                    return;
                }
                res.status(500).send("Error updating user");
            }
        });
    }
    del(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deleted = yield userModel_1.default.findByIdAndDelete(req.params.id).select("-password -refreshTokens");
                if (!deleted) {
                    res.status(404).send("User not found");
                    return;
                }
                res.json({ message: "User deleted" });
            }
            catch (_a) {
                res.status(500).send("Error deleting user");
            }
        });
    }
}
exports.default = new UsersController();
//# sourceMappingURL=usersController.js.map