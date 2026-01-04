// src/tests/auth.test.ts
import request from "supertest";
import initApp from "../index";
import { Express } from "express";
import { UserModel } from "../models/userModel";
import { userData, postsList } from "./utils";

let app: Express;

beforeAll(async () => {
  app = await initApp();
  await UserModel.deleteMany();
});

afterAll(async () => {
  await UserModel.deleteMany();
});

describe("Auth API Tests", () => {
  test("Creating post without token should fail", async () => {
    const postData = postsList[0];

    const response = await request(app).post("/posts").send(postData);

    expect(response.status).toBe(401);
  });

  test("User registration", async () => {
    const response = await request(app).post("/auth/register").send({
      email: userData.email,
      password: userData.password,
      username: userData.username,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("refreshToken");

    userData.token = response.body.token;
    userData.refreshToken = response.body.refreshToken;
    userData._id = response.body._id;
  });

  test("Creating post with valid token should succeed", async () => {
    const postData = postsList[0];

    const response = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${userData.token}`)
      .send(postData);

    expect(response.status).toBe(201);
  });

  test("Creating post with compromised token should fail", async () => {
    const postData = postsList[0];
    const badToken = userData.token + "x";

    const response = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${badToken}`)
      .send(postData);

    expect(response.status).toBe(401);
  });

  test("User login", async () => {
    const response = await request(app).post("/auth/login").send({
      email: userData.email,
      password: userData.password,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("refreshToken");

    userData.token = response.body.token;
    userData.refreshToken = response.body.refreshToken;
  });

  jest.setTimeout(10000);

  test("Expired token should fail, refresh should succeed", async () => {
    // wait for token to expire (must match your server's JWT expiry for tests)
    await new Promise((r) => setTimeout(r, 5000));

    const postData = postsList[0];

    const failedResponse = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${userData.token}`)
      .send(postData);

    expect(failedResponse.status).toBe(401);

    const refreshResponse = await request(app).post("/auth/refresh").send({
      refreshToken: userData.refreshToken,
    });

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body).toHaveProperty("token");
    expect(refreshResponse.body).toHaveProperty("refreshToken");

    userData.token = refreshResponse.body.token;
    userData.refreshToken = refreshResponse.body.refreshToken;

    const retryResponse = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${userData.token}`)
      .send(postData);

    expect(retryResponse.status).toBe(201);
  });

  test("Double use of refresh token should fail", async () => {
    const refreshResponse1 = await request(app).post("/auth/refresh").send({
      refreshToken: userData.refreshToken,
    });

    expect(refreshResponse1.status).toBe(200);
    expect(refreshResponse1.body).toHaveProperty("token");
    expect(refreshResponse1.body).toHaveProperty("refreshToken");

    const newRefreshToken = refreshResponse1.body.refreshToken;

    // using the old refresh token again should fail
    const refreshResponse2 = await request(app).post("/auth/refresh").send({
      refreshToken: userData.refreshToken,
    });
    expect(refreshResponse2.status).toBe(401);

    // NOTE: if your design allows the new refresh token to work, then this should be 200.
    // If your design invalidates refresh tokens immediately (single-use + rotation with server-side storage),
    // then this may be 401. Adjust based on your implementation.
    const refreshResponse3 = await request(app).post("/auth/refresh").send({
      refreshToken: newRefreshToken,
    });
    expect(refreshResponse3.status).toBe(401);
  });
});
