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
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = __importDefault(require("../index"));
const postModel_1 = __importDefault(require("../models/postModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const utils_1 = require("./utils");
let app;
let user1;
let user2;
let postId = "";
const postsList = [
    { title: "Post One", content: "Content of post one" },
    { title: "Post Two", content: "Content of post two" },
    { title: "Post Three", content: "Content of post three" },
];
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    process.env.JWT_EXPIRES_IN = "3s";
    process.env.JWT_SECRET = "test_secret";
    app = yield (0, index_1.default)();
    yield postModel_1.default.deleteMany();
    yield userModel_1.default.deleteMany();
    user1 = yield (0, utils_1.getLogedInUser)(app, {
        email: "user1@test.com",
        password: "pass123",
        username: "user1",
    });
    user2 = yield (0, utils_1.getLogedInUser)(app, {
        email: "user2@test.com",
        password: "pass123",
        username: "user2",
    });
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    //await postModel.deleteMany();
    yield mongoose_1.default.connection.close();
}));
describe("Posts Test Suite", () => {
    test("Initial empty posts", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/posts");
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    }));
    test("Create post without token fails (401)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/posts").send(postsList[0]);
        expect(response.status).toBe(401);
    }));
    test("Create Posts", () => __awaiter(void 0, void 0, void 0, function* () {
        for (const post of postsList) {
            const response = yield (0, supertest_1.default)(app)
                .post("/posts")
                .set("Authorization", "Bearer " + user1.token)
                .send(post);
            expect(response.status).toBe(201);
            expect(response.body.title).toBe(post.title);
            expect(response.body.content).toBe(post.content);
            expect(response.body).toHaveProperty("createdBy");
            postId = response.body._id;
            expect(postId).toBeTruthy();
        }
    }));
    test("Get All Posts", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/posts");
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(postsList.length);
    }));
    test("Get Post by ID", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/posts/" + postId);
        expect(response.status).toBe(200);
        expect(response.body._id).toBe(postId);
    }));
    test("Get Post by ID - not found (404)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/posts/507f1f77bcf86cd799439099");
        expect(response.status).toBe(404);
    }));
    test("Update post without token fails (401)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .put("/posts/" + postId)
            .send({ title: "x", content: "y" });
        expect(response.status).toBe(401);
    }));
    test("Update Post by non-creator fails (403)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .put("/posts/" + postId)
            .set("Authorization", "Bearer " + user2.token)
            .send({ title: "hacker", content: "hacker content" });
        expect(response.status).toBe(403);
        expect(response.text).toBe("Forbidden: You are not the creator of this post");
    }));
    test("Update Post cannot change createdBy (400)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .put("/posts/" + postId)
            .set("Authorization", "Bearer " + user1.token)
            .send({ createdBy: "507f1f77bcf86cd799439055" });
        expect(response.status).toBe(400);
        expect(response.text).toBe("Cannot change creator of the post");
    }));
    test("Update Post - not found (404)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .put("/posts/507f1f77bcf86cd799439099")
            .set("Authorization", "Bearer " + user1.token)
            .send({ title: "new", content: "new content" });
        expect(response.status).toBe(404);
    }));
    test("Update Post", () => __awaiter(void 0, void 0, void 0, function* () {
        const updated = {
            title: "Post Updated",
            content: "Updated content",
        };
        const response = yield (0, supertest_1.default)(app)
            .put("/posts/" + postId)
            .set("Authorization", "Bearer " + user1.token)
            .send(updated);
        expect(response.status).toBe(200);
        expect(response.body.title).toBe(updated.title);
        expect(response.body.content).toBe(updated.content);
        expect(response.body._id).toBe(postId);
        expect(response.body).toHaveProperty("createdBy");
    }));
    test("Delete post without token fails (401)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).delete("/posts/" + postId);
        expect(response.status).toBe(401);
    }));
    test("Delete Post by non-creator fails (403)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .delete("/posts/" + postId)
            .set("Authorization", "Bearer " + user2.token);
        expect(response.status).toBe(403);
        expect(response.text).toBe("Forbidden: You are not the creator of this post");
    }));
    test("Delete Post - not found (404)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .delete("/posts/507f1f77bcf86cd799439099")
            .set("Authorization", "Bearer " + user1.token);
        expect(response.status).toBe(404);
    }));
    test("Delete Post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .delete("/posts/" + postId)
            .set("Authorization", "Bearer " + user1.token);
        expect(response.status).toBe(200);
        expect(response.body._id).toBe(postId);
        const getResponse = yield (0, supertest_1.default)(app).get("/posts/" + postId);
        expect(getResponse.status).toBe(404);
    }));
});
//# sourceMappingURL=posts.test.js.map