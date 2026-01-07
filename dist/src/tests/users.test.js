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
const userModel_1 = __importDefault(require("../models/userModel"));
let app;
const registerAndLogin = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const username = `user_${Date.now()}`;
    const email = `user_${Date.now()}@test.com`;
    const password = "123456";
    yield (0, supertest_1.default)(app).post("/auth/register").send({ username, email, password }).expect(201);
    const loginRes = yield (0, supertest_1.default)(app).post("/auth/login").send({ email, password }).expect(200);
    const accessToken = (_j = (_f = (_d = (_b = (_a = loginRes.body) === null || _a === void 0 ? void 0 : _a.accessToken) !== null && _b !== void 0 ? _b : (_c = loginRes.body) === null || _c === void 0 ? void 0 : _c.token) !== null && _d !== void 0 ? _d : (_e = loginRes.body) === null || _e === void 0 ? void 0 : _e.access_token) !== null && _f !== void 0 ? _f : (_h = (_g = loginRes.body) === null || _g === void 0 ? void 0 : _g.data) === null || _h === void 0 ? void 0 : _h.accessToken) !== null && _j !== void 0 ? _j : (_l = (_k = loginRes.body) === null || _k === void 0 ? void 0 : _k.data) === null || _l === void 0 ? void 0 : _l.token;
    if (!accessToken) {
        throw new Error(`Login response missing token. Body: ${JSON.stringify(loginRes.body)}`);
    }
    const me = yield userModel_1.default.findOne({ email });
    if (!(me === null || me === void 0 ? void 0 : me._id)) {
        throw new Error("User not found in DB after register");
    }
    return { accessToken, userId: me._id.toString(), email, password, username };
});
const getNonExistingObjectId = () => new mongoose_1.default.Types.ObjectId().toString();
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    process.env.JWT_SECRET = "test_secret";
    process.env.JWT_EXPIRES_IN = "10m";
    app = yield (0, index_1.default)();
    yield userModel_1.default.deleteMany();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
}));
describe("Users CRUD", () => {
    it("POST /users should create a user", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .post("/users")
            .send({
            username: "new_user",
            email: "new_user@test.com",
            password: "123456",
        })
            .expect(201);
        expect(res.body).toHaveProperty("_id");
        expect(res.body).toHaveProperty("username", "new_user");
        expect(res.body).toHaveProperty("email", "new_user@test.com");
        expect(res.body).not.toHaveProperty("password");
        expect(res.body).not.toHaveProperty("refreshTokens");
    }));
    it("POST /users should return 400 when missing fields", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app)
            .post("/users")
            .send({
            username: "missing_password",
            email: "missing_password@test.com",
        })
            .expect(400);
    }));
    it("POST /users should return 409 when user already exists", () => __awaiter(void 0, void 0, void 0, function* () {
        const email = `dup_${Date.now()}@test.com`;
        yield (0, supertest_1.default)(app)
            .post("/users")
            .send({ username: `dup_${Date.now()}`, email, password: "123456" })
            .expect(201);
        yield (0, supertest_1.default)(app)
            .post("/users")
            .send({ username: `dup2_${Date.now()}`, email, password: "123456" })
            .expect(409);
    }));
    it("GET /users should return users (requires auth)", () => __awaiter(void 0, void 0, void 0, function* () {
        const { accessToken } = yield registerAndLogin();
        const res = yield (0, supertest_1.default)(app)
            .get("/users")
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    }));
    it("GET /users without token should return 401", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app).get("/users").expect(401);
    }));
    it("GET /users/:id should return a user (requires auth)", () => __awaiter(void 0, void 0, void 0, function* () {
        const { accessToken, userId } = yield registerAndLogin();
        const res = yield (0, supertest_1.default)(app)
            .get(`/users/${userId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);
        expect(res.body).toHaveProperty("_id", userId);
        expect(res.body).toHaveProperty("email");
        expect(res.body).not.toHaveProperty("password");
        expect(res.body).not.toHaveProperty("refreshTokens");
    }));
    it("GET /users/:id should return 404 when user not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const { accessToken } = yield registerAndLogin();
        const id = getNonExistingObjectId();
        yield (0, supertest_1.default)(app)
            .get(`/users/${id}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(404);
    }));
    it("PUT /users/:id should update user username (requires auth)", () => __awaiter(void 0, void 0, void 0, function* () {
        const { accessToken, userId } = yield registerAndLogin();
        const res = yield (0, supertest_1.default)(app)
            .put(`/users/${userId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ username: "updated_name" })
            .expect(200);
        expect(res.body).toHaveProperty("_id", userId);
        expect(res.body).toHaveProperty("username", "updated_name");
    }));
    it("PUT /users/:id should update user email (requires auth)", () => __awaiter(void 0, void 0, void 0, function* () {
        const { accessToken, userId } = yield registerAndLogin();
        const newEmail = `updated_${Date.now()}@test.com`;
        const res = yield (0, supertest_1.default)(app)
            .put(`/users/${userId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ email: newEmail })
            .expect(200);
        expect(res.body).toHaveProperty("_id", userId);
        expect(res.body).toHaveProperty("email", newEmail);
    }));
    it("PUT /users/:id should update user password (requires auth)", () => __awaiter(void 0, void 0, void 0, function* () {
        const { accessToken, userId, email } = yield registerAndLogin();
        yield (0, supertest_1.default)(app)
            .put(`/users/${userId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ password: "newpass123" })
            .expect(200);
        yield (0, supertest_1.default)(app)
            .post("/auth/login")
            .send({ email, password: "newpass123" })
            .expect(200);
    }));
    it("PUT /users/:id should return 404 when user not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const { accessToken } = yield registerAndLogin();
        const id = getNonExistingObjectId();
        yield (0, supertest_1.default)(app)
            .put(`/users/${id}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ username: "nope" })
            .expect(404);
    }));
    it("PUT /users/:id should return 409 when email already in use", () => __awaiter(void 0, void 0, void 0, function* () {
        const { accessToken, userId } = yield registerAndLogin();
        const email = `taken_${Date.now()}@test.com`;
        yield (0, supertest_1.default)(app)
            .post("/users")
            .send({ username: `taken_${Date.now()}`, email, password: "123456" })
            .expect(201);
        yield (0, supertest_1.default)(app)
            .put(`/users/${userId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ email })
            .expect(409);
    }));
    it("DELETE /users/:id should delete user (requires auth)", () => __awaiter(void 0, void 0, void 0, function* () {
        const { accessToken, userId } = yield registerAndLogin();
        yield (0, supertest_1.default)(app)
            .delete(`/users/${userId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);
        const check = yield userModel_1.default.findById(userId);
        expect(check).toBeNull();
    }));
    it("DELETE /users/:id should return 404 when user not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const { accessToken } = yield registerAndLogin();
        const id = getNonExistingObjectId();
        yield (0, supertest_1.default)(app)
            .delete(`/users/${id}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(404);
    }));
    it("GET /users with invalid token should return 401", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app)
            .get("/users")
            .set("Authorization", "Bearer invalid.token.here")
            .expect(401);
    }));
});
//# sourceMappingURL=users.test.js.map