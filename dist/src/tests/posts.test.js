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
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../index"));
const mongoose_1 = __importDefault(require("mongoose"));
const postModel_1 = __importDefault(require("../models/postModel"));
const utils_1 = require("./utils");
let app;
let loginUser;
let postId = "";
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    process.env.JWT_EXPIRES_IN = "3s";
    process.env.JWT_SECRET = "test_secret";
    app = yield (0, index_1.default)();
    yield postModel_1.default.deleteMany();
    loginUser = yield (0, utils_1.getLogedInUser)(app);
}));
// Test data is cleaned up after execution.
// Disable cleanup (deleteMany) temporarily to view data in MongoDB Compass.
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield postModel_1.default.deleteMany();
    yield mongoose_1.default.connection.close();
}));
describe("Posts Test Suite", () => {
    test("Initial empty posts", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/posts");
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    }));
    test("Create Posts", () => __awaiter(void 0, void 0, void 0, function* () {
        for (const post of utils_1.postsList) {
            const response = yield (0, supertest_1.default)(app)
                .post("/posts")
                .set("Authorization", "Bearer " + loginUser.token)
                .send(post);
            expect(response.status).toBe(201);
            expect(response.body.title).toBe(post.title);
            expect(response.body.content).toBe(post.content);
            postId = response.body._id;
        }
    }));
    test("Get All Posts", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/posts");
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(utils_1.postsList.length);
    }));
    test("Get Post by ID", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/posts/" + postId);
        expect(response.status).toBe(200);
        expect(response.body._id).toBe(postId);
    }));
    test("Update Post", () => __awaiter(void 0, void 0, void 0, function* () {
        const updated = {
            title: "Post Updated",
            content: "Updated content",
        };
        const response = yield (0, supertest_1.default)(app)
            .put("/posts/" + postId)
            .set("Authorization", "Bearer " + loginUser.token)
            .send(updated);
        expect(response.status).toBe(200);
        expect(response.body.title).toBe(updated.title);
        expect(response.body.content).toBe(updated.content);
        expect(response.body._id).toBe(postId);
    }));
    test("Delete Post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .delete("/posts/" + postId)
            .set("Authorization", "Bearer " + loginUser.token);
        expect(response.status).toBe(200);
        expect(response.body._id).toBe(postId);
        const getResponse = yield (0, supertest_1.default)(app).get("/posts/" + postId);
        expect(getResponse.status).toBe(404);
    }));
});
//# sourceMappingURL=posts.test.js.map