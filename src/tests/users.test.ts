import request from "supertest";
import { Express } from "express";
import mongoose from "mongoose";
import initApp from "../index";
import UserModel from "../models/userModel";

let app: Express;

const registerAndLogin = async () => {
  const username = `user_${Date.now()}`;
  const email = `user_${Date.now()}@test.com`;
  const password = "123456";

  await request(app).post("/auth/register").send({ username, email, password }).expect(201);

  const loginRes = await request(app).post("/auth/login").send({ email, password }).expect(200);

  const accessToken =
    loginRes.body?.accessToken ??
    loginRes.body?.token ??
    loginRes.body?.access_token ??
    loginRes.body?.data?.accessToken ??
    loginRes.body?.data?.token;

  if (!accessToken) {
    throw new Error(`Login response missing token. Body: ${JSON.stringify(loginRes.body)}`);
  }

  const me = await UserModel.findOne({ email });
  if (!me?._id) {
    throw new Error("User not found in DB after register");
  }

  return { accessToken, userId: me._id.toString(), email, password, username };
};

const getNonExistingObjectId = () => new mongoose.Types.ObjectId().toString();

beforeAll(async () => {
  process.env.JWT_SECRET = "test_secret";
  process.env.JWT_EXPIRES_IN = "10m";

  app = await initApp();
  await UserModel.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Users CRUD", () => {
  it("POST /users should create a user", async () => {
    const res = await request(app)
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
  });

  it("POST /users should return 400 when missing fields", async () => {
    await request(app)
      .post("/users")
      .send({
        username: "missing_password",
        email: "missing_password@test.com",
      })
      .expect(400);
  });

  it("POST /users should return 409 when user already exists", async () => {
    const email = `dup_${Date.now()}@test.com`;
    await request(app)
      .post("/users")
      .send({ username: `dup_${Date.now()}`, email, password: "123456" })
      .expect(201);

    await request(app)
      .post("/users")
      .send({ username: `dup2_${Date.now()}`, email, password: "123456" })
      .expect(409);
  });

  it("GET /users should return users (requires auth)", async () => {
    const { accessToken } = await registerAndLogin();

    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("GET /users without token should return 401", async () => {
    await request(app).get("/users").expect(401);
  });

  it("GET /users/:id should return a user (requires auth)", async () => {
    const { accessToken, userId } = await registerAndLogin();

    const res = await request(app)
      .get(`/users/${userId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty("_id", userId);
    expect(res.body).toHaveProperty("email");
    expect(res.body).not.toHaveProperty("password");
    expect(res.body).not.toHaveProperty("refreshTokens");
  });

  it("GET /users/:id should return 404 when user not found", async () => {
    const { accessToken } = await registerAndLogin();
    const id = getNonExistingObjectId();

    await request(app)
      .get(`/users/${id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(404);
  });

  it("PUT /users/:id should update user username (requires auth)", async () => {
    const { accessToken, userId } = await registerAndLogin();

    const res = await request(app)
      .put(`/users/${userId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: "updated_name" })
      .expect(200);

    expect(res.body).toHaveProperty("_id", userId);
    expect(res.body).toHaveProperty("username", "updated_name");
  });

  it("PUT /users/:id should update user email (requires auth)", async () => {
    const { accessToken, userId } = await registerAndLogin();

    const newEmail = `updated_${Date.now()}@test.com`;

    const res = await request(app)
      .put(`/users/${userId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ email: newEmail })
      .expect(200);

    expect(res.body).toHaveProperty("_id", userId);
    expect(res.body).toHaveProperty("email", newEmail);
  });

  it("PUT /users/:id should update user password (requires auth)", async () => {
    const { accessToken, userId, email } = await registerAndLogin();

    await request(app)
      .put(`/users/${userId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ password: "newpass123" })
      .expect(200);

    await request(app)
      .post("/auth/login")
      .send({ email, password: "newpass123" })
      .expect(200);
  });

  it("PUT /users/:id should return 404 when user not found", async () => {
    const { accessToken } = await registerAndLogin();
    const id = getNonExistingObjectId();

    await request(app)
      .put(`/users/${id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: "nope" })
      .expect(404);
  });

  it("PUT /users/:id should return 409 when email already in use", async () => {
    const { accessToken, userId } = await registerAndLogin();

    const email = `taken_${Date.now()}@test.com`;
    await request(app)
      .post("/users")
      .send({ username: `taken_${Date.now()}`, email, password: "123456" })
      .expect(201);

    await request(app)
      .put(`/users/${userId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ email })
      .expect(409);
  });

  it("DELETE /users/:id should delete user (requires auth)", async () => {
    const { accessToken, userId } = await registerAndLogin();

    await request(app)
      .delete(`/users/${userId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const check = await UserModel.findById(userId);
    expect(check).toBeNull();
  });

  it("DELETE /users/:id should return 404 when user not found", async () => {
    const { accessToken } = await registerAndLogin();
    const id = getNonExistingObjectId();

    await request(app)
      .delete(`/users/${id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(404);
  });

  it("GET /users with invalid token should return 401", async () => {
  await request(app)
    .get("/users")
    .set("Authorization", "Bearer invalid.token.here")
    .expect(401);
});

});