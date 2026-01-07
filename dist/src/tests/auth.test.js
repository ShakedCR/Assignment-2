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
const userModel_1 = __importDefault(require("../models/userModel"));
const utils_1 = require("./utils");
let app;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    process.env.JWT_EXPIRES_IN = "3s";
    process.env.JWT_SECRET = "test_secret";
    app = yield (0, index_1.default)();
    yield userModel_1.default.deleteMany();
}));
// Test data is cleaned up after execution.
// Disable cleanup (deleteMany) temporarily to view data in MongoDB Compass.
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield userModel_1.default.deleteMany();
    yield mongoose_1.default.connection.close();
}));
describe("Test Auth Suite", () => {
    test("Create post without token fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const postData = utils_1.postsList[0];
        const response = yield (0, supertest_1.default)(app).post("/posts").send(postData);
        expect(response.status).toBe(401);
    }));
    test("Register without email should fail", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/register")
            .send({ password: utils_1.userData.password, username: utils_1.userData.username });
        expect(response.status).toBe(400);
    }));
    test("Register without password should fail", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/register")
            .send({ email: utils_1.userData.email, username: utils_1.userData.username });
        expect(response.status).toBe(400);
    }));
    test("Register without username should fail", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/register")
            .send({ email: "nousername@example.com", password: "password123" });
        expect([400, 500]).toContain(response.status);
    }));
    test("Login without email should fail", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/login")
            .send({ password: utils_1.userData.password });
        expect(response.status).toBe(400);
    }));
    test("Login without password should fail", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/login")
            .send({ email: utils_1.userData.email });
        expect(response.status).toBe(400);
    }));
    test("Refresh without refreshToken should fail", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/auth/refresh").send({});
        expect(response.status).toBe(400);
    }));
    test("Logout without refreshToken should fail", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/auth/logout").send({});
        expect(response.status).toBe(400);
    }));
    test("Logout with invalid refreshToken should fail", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/logout")
            .send({ refreshToken: "invalid.token.value" });
        expect([401, 400]).toContain(response.status);
    }));
    test("Registration succeeds", () => __awaiter(void 0, void 0, void 0, function* () {
        const email = utils_1.userData.email;
        const password = utils_1.userData.password;
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/register")
            .send({ email, password, username: utils_1.userData.username });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("token");
        expect(response.body).toHaveProperty("refreshToken");
        utils_1.userData.token = response.body.token;
        utils_1.userData.refreshToken = response.body.refreshToken;
        utils_1.userData._id = response.body._id;
    }));
    test("Duplicate registration (same email) should fail", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/register")
            .send({ email: utils_1.userData.email, password: "password123", username: "another" });
        expect([409, 400, 500]).toContain(response.status);
    }));
    test("Create post with valid token succeeds", () => __awaiter(void 0, void 0, void 0, function* () {
        const postData = utils_1.postsList[0];
        const response = yield (0, supertest_1.default)(app)
            .post("/posts")
            .set("Authorization", "Bearer " + utils_1.userData.token)
            .send(postData);
        expect(response.status).toBe(201);
    }));
    test("Create post with compromised token fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const postData = utils_1.postsList[0];
        const compromisedToken = utils_1.userData.token + "a";
        const response = yield (0, supertest_1.default)(app)
            .post("/posts")
            .set("Authorization", "Bearer " + compromisedToken)
            .send(postData);
        expect(response.status).toBe(401);
    }));
    test("Login succeeds", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/login")
            .send({ email: utils_1.userData.email, password: utils_1.userData.password });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("token");
        expect(response.body).toHaveProperty("refreshToken");
        utils_1.userData.token = response.body.token;
        utils_1.userData.refreshToken = response.body.refreshToken;
    }));
    test("Login with wrong password fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/login")
            .send({ email: utils_1.userData.email, password: "wrongpassword" });
        expect(response.status).toBe(401);
    }));
    test("Login with non-existing user fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/login")
            .send({ email: "notexists@example.com", password: "password123" });
        expect(response.status).toBe(401);
    }));
    jest.setTimeout(10000);
    test("Expired token should fail, refresh should succeed", () => __awaiter(void 0, void 0, void 0, function* () {
        yield new Promise((r) => setTimeout(r, 5000));
        const postData = utils_1.postsList[0];
        const failedResponse = yield (0, supertest_1.default)(app)
            .post("/posts")
            .set("Authorization", "Bearer " + utils_1.userData.token)
            .send(postData);
        expect(failedResponse.status).toBe(401);
        const refreshResponse = yield (0, supertest_1.default)(app)
            .post("/auth/refresh")
            .send({ refreshToken: utils_1.userData.refreshToken });
        expect(refreshResponse.status).toBe(200);
        expect(refreshResponse.body).toHaveProperty("token");
        expect(refreshResponse.body).toHaveProperty("refreshToken");
        utils_1.userData.token = refreshResponse.body.token;
        utils_1.userData.refreshToken = refreshResponse.body.refreshToken;
        const retryResponse = yield (0, supertest_1.default)(app)
            .post("/posts")
            .set("Authorization", "Bearer " + utils_1.userData.token)
            .send(postData);
        expect(retryResponse.status).toBe(201);
    }));
    test("Refresh with invalid token format fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/refresh")
            .send({ refreshToken: "not.a.jwt" });
        expect(response.status).toBe(401);
    }));
    test("Logout should invalidate refresh token", () => __awaiter(void 0, void 0, void 0, function* () {
        const logoutResponse = yield (0, supertest_1.default)(app)
            .post("/auth/logout")
            .send({ refreshToken: utils_1.userData.refreshToken });
        expect(logoutResponse.status).toBe(200);
        const refreshAfterLogout = yield (0, supertest_1.default)(app)
            .post("/auth/refresh")
            .send({ refreshToken: utils_1.userData.refreshToken });
        expect(refreshAfterLogout.status).toBe(401);
        const loginRes = yield (0, supertest_1.default)(app)
            .post("/auth/login")
            .send({ email: utils_1.userData.email, password: utils_1.userData.password });
        expect(loginRes.status).toBe(200);
        expect(loginRes.body).toHaveProperty("refreshToken");
        utils_1.userData.token = loginRes.body.token;
        utils_1.userData.refreshToken = loginRes.body.refreshToken;
    }));
    test("Double use of refresh token fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const refreshResponse1 = yield (0, supertest_1.default)(app)
            .post("/auth/refresh")
            .send({ refreshToken: utils_1.userData.refreshToken });
        expect(refreshResponse1.status).toBe(200);
        const newRefreshToken = refreshResponse1.body.refreshToken;
        const refreshResponse2 = yield (0, supertest_1.default)(app)
            .post("/auth/refresh")
            .send({ refreshToken: utils_1.userData.refreshToken });
        expect(refreshResponse2.status).toBe(401);
        const refreshResponse3 = yield (0, supertest_1.default)(app)
            .post("/auth/refresh")
            .send({ refreshToken: newRefreshToken });
        expect(refreshResponse3.status).toBe(401);
    }));
    test("getLogedInUser should login when user already exists", () => __awaiter(void 0, void 0, void 0, function* () {
        const u = {
            email: `u_${Date.now()}@test.com`,
            password: "123456",
            username: `u_${Date.now()}`,
        };
        yield (0, supertest_1.default)(app).post("/auth/register").send(u).expect(201);
        const me = yield (0, utils_1.getLogedInUser)(app, u);
        expect(me.token).toBeTruthy();
    }));
});
//# sourceMappingURL=auth.test.js.map