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
const commentModel_1 = __importDefault(require("../models/commentModel"));
const utils_1 = require("./utils");
let app;
let loginUser;
let commentId = "";
const commentsList = [
    { content: "this is my comment", postId: "507f1f77bcf86cd799439011" },
    { content: "this is my second comment", postId: "507f1f77bcf86cd799439012" },
    { content: "this is my third comment", postId: "507f1f77bcf86cd799439013" },
    { content: "this is my fourth comment", postId: "507f1f77bcf86cd799439013" },
];
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    process.env.JWT_EXPIRES_IN = "3s";
    process.env.JWT_SECRET = "test_secret";
    app = yield (0, index_1.default)();
    yield commentModel_1.default.deleteMany();
    loginUser = yield (0, utils_1.getLogedInUser)(app, {
        email: "comments@test.com",
        password: "pass123",
        username: "commentsUser",
    });
}));
// Test data is cleaned up after execution.
// Disable cleanup (deleteMany) temporarily to view data in MongoDB Compass.
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // await commentsModel.deleteMany();
    yield mongoose_1.default.connection.close();
}));
describe("Comments Test Suite", () => {
    test("Initial empty comments", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/comment");
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    }));
    test("Create comment without token fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/comment").send(commentsList[0]);
        expect(response.status).toBe(401);
    }));
    test("Create comment with invalid token fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/comment")
            .set("Authorization", "Bearer " + loginUser.token + "x")
            .send(commentsList[0]);
        expect(response.status).toBe(401);
    }));
    test("Create Comment", () => __awaiter(void 0, void 0, void 0, function* () {
        for (const comment of commentsList) {
            const response = yield (0, supertest_1.default)(app)
                .post("/comment")
                .set("Authorization", "Bearer " + loginUser.token)
                .send(comment);
            expect(response.status).toBe(201);
            expect(response.body.content).toBe(comment.content);
            expect(response.body.postId).toBe(comment.postId);
        }
    }));
    test("Get All Comments", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/comment");
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(commentsList.length);
    }));
    test("Get Comments by postId", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/comment?postId=" + commentsList[0].postId);
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].content).toBe(commentsList[0].content);
        commentId = response.body[0]._id;
        expect(commentId).toBeTruthy();
    }));
    test("Get Comment by ID", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/comment/" + commentId);
        expect(response.status).toBe(200);
        expect(response.body.content).toBe(commentsList[0].content);
        expect(response.body.postId).toBe(commentsList[0].postId);
        expect(response.body._id).toBe(commentId);
    }));
    test("Get Comment by non-existing ID returns 404", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/comment/507f1f77bcf86cd799439099");
        expect(response.status).toBe(404);
    }));
    test("Update comment without token fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .put("/comment/" + commentId)
            .send({ content: "x" });
        expect(response.status).toBe(401);
    }));
    test("Update Comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const updated = {
            content: "This is an updated comment",
            postId: "507f1f77bcf86cd799439044",
        };
        const response = yield (0, supertest_1.default)(app)
            .put("/comment/" + commentId)
            .set("Authorization", "Bearer " + loginUser.token)
            .send(updated);
        expect(response.status).toBe(200);
        expect(response.body.content).toBe(updated.content);
        expect(response.body.postId).toBe(updated.postId);
        expect(response.body._id).toBe(commentId);
    }));
    test("Update non-existing comment returns 404", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .put("/comment/507f1f77bcf86cd799439099")
            .set("Authorization", "Bearer " + loginUser.token)
            .send({ content: "x", postId: "507f1f77bcf86cd799439011" });
        expect(response.status).toBe(404);
    }));
    test("Delete comment without token fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).delete("/comment/" + commentId);
        expect(response.status).toBe(401);
    }));
    test("Delete Comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .delete("/comment/" + commentId)
            .set("Authorization", "Bearer " + loginUser.token);
        expect(response.status).toBe(200);
        expect(response.body._id).toBe(commentId);
        const getResponse = yield (0, supertest_1.default)(app).get("/comment/" + commentId);
        expect(getResponse.status).toBe(404);
    }));
    test("Delete non-existing comment returns 404", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .delete("/comment/507f1f77bcf86cd799439099")
            .set("Authorization", "Bearer " + loginUser.token);
        expect(response.status).toBe(404);
    }));
});
//# sourceMappingURL=comments.test.js.map