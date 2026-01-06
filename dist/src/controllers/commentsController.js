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
const commentModel_1 = __importDefault(require("../models/commentModel"));
const baseController_1 = __importDefault(require("./baseController"));
class CommentsController extends baseController_1.default {
    constructor() {
        super(commentModel_1.default);
    }
    create(req, res) {
        const _super = Object.create(null, {
            create: { get: () => super.create }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (req.user) {
                req.body.userId = req.user._id;
            }
            return _super.create.call(this, req, res);
        });
    }
    del(req, res) {
        const _super = Object.create(null, {
            del: { get: () => super.del }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const comment = yield this.model.findById(id);
                if (!comment) {
                    res.status(404).send("Comment not found");
                    return;
                }
                if (req.user && comment.userId.toString() === req.user._id) {
                    _super.del.call(this, req, res);
                    return;
                }
                else {
                    res
                        .status(403)
                        .send("Forbidden: You are not the creator of this comment");
                    return;
                }
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error deleting comment");
            }
        });
    }
    update(req, res) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const comment = yield this.model.findById(id);
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
                if (req.body.userId &&
                    req.body.userId !== comment.userId.toString()) {
                    res.status(400).send("Cannot change creator of the comment");
                    return;
                }
                _super.update.call(this, req, res);
                return;
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error updating comment");
            }
        });
    }
}
exports.default = new CommentsController();
//# sourceMappingURL=commentsController.js.map