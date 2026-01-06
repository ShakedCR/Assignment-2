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
const postModel_1 = __importDefault(require("../models/postModel"));
const baseController_1 = __importDefault(require("./baseController"));
class PostsController extends baseController_1.default {
    constructor() {
        super(postModel_1.default);
    }
    create(req, res) {
        const _super = Object.create(null, {
            create: { get: () => super.create }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const authReq = req;
            if (authReq.user) {
                req.body.createdBy = authReq.user._id;
            }
            yield _super.create.call(this, req, res);
        });
    }
    del(req, res) {
        const _super = Object.create(null, {
            del: { get: () => super.del }
        });
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            const authReq = req;
            const id = req.params.id;
            try {
                const post = yield this.model.findById(id);
                if (!post) {
                    res.status(404).send("Post not found");
                    return;
                }
                const creatorId = (_b = (_a = post.createdBy) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a);
                const userId = (_f = (_e = (_d = (_c = authReq.user) === null || _c === void 0 ? void 0 : _c._id) === null || _d === void 0 ? void 0 : _d.toString) === null || _e === void 0 ? void 0 : _e.call(_d)) !== null && _f !== void 0 ? _f : (_g = authReq.user) === null || _g === void 0 ? void 0 : _g._id;
                if (userId && creatorId === userId) {
                    yield _super.del.call(this, req, res);
                    return;
                }
                res.status(403).send("Forbidden: You are not the creator of this post");
                return;
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error deleting post");
                return;
            }
        });
    }
    update(req, res) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const authReq = req;
            const id = req.params.id;
            try {
                const post = yield this.model.findById(id);
                if (!post) {
                    res.status(404).send("Post not found");
                    return;
                }
                const creatorId = (_b = (_a = post.createdBy) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a);
                const userId = (_f = (_e = (_d = (_c = authReq.user) === null || _c === void 0 ? void 0 : _c._id) === null || _d === void 0 ? void 0 : _d.toString) === null || _e === void 0 ? void 0 : _e.call(_d)) !== null && _f !== void 0 ? _f : (_g = authReq.user) === null || _g === void 0 ? void 0 : _g._id;
                if (!userId || creatorId !== userId) {
                    res.status(403).send("Forbidden: You are not the creator of this post");
                    return;
                }
                if (((_h = req.body) === null || _h === void 0 ? void 0 : _h.createdBy) && req.body.createdBy.toString() !== creatorId) {
                    res.status(400).send("Cannot change creator of the post");
                    return;
                }
                req.body.createdBy = creatorId;
                yield _super.update.call(this, req, res);
                return;
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error updating post");
                return;
            }
        });
    }
}
exports.default = new PostsController();
//# sourceMappingURL=postsController.js.map