import request from "supertest";
import initApp from "../index";
import { Express } from "express";
import mongoose from "mongoose";
import User from "../models/userModel";
import { userData, postsList, getLogedInUser } from "./utils";


let app: Express;


beforeAll(async () => {
  process.env.JWT_EXPIRES_IN = "3s";
  process.env.JWT_SECRET = "test_secret";
  app = await initApp();
  await User.deleteMany();
});

// Test data is cleaned up after execution.
// Disable cleanup (deleteMany) temporarily to view data in MongoDB Compass.
afterAll(async () => {
  //await User.deleteMany();
  await mongoose.connection.close();
});

describe("Test Auth Suite", () => {
  test("Create post without token fails", async () => {
    const postData = postsList[0];
    const response = await request(app).post("/posts").send(postData);
    expect(response.status).toBe(401);
  });

  test("Register without email should fail", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({ password: userData.password, username: userData.username });
    expect(response.status).toBe(400);
  });

  test("Register without password should fail", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({ email: userData.email, username: userData.username });
    expect(response.status).toBe(400);
  });

  test("Register without username should fail", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({ email: "nousername@example.com", password: "password123" });
    expect([400, 500]).toContain(response.status);
  });

  test("Login without email should fail", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ password: userData.password });
    expect(response.status).toBe(400);
  });

  test("Login without password should fail", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: userData.email });
    expect(response.status).toBe(400);
  });

  test("Refresh without refreshToken should fail", async () => {
    const response = await request(app).post("/auth/refresh").send({});
    expect(response.status).toBe(400);
  });

  test("Logout without refreshToken should fail", async () => {
    const response = await request(app).post("/auth/logout").send({});
    expect(response.status).toBe(400);
  });

  test("Logout with invalid refreshToken should fail", async () => {
    const response = await request(app)
      .post("/auth/logout")
      .send({ refreshToken: "invalid.token.value" });
    expect([401, 400]).toContain(response.status);
  });

  test("Registration succeeds", async () => {
    const email = userData.email;
    const password = userData.password;

    const response = await request(app)
      .post("/auth/register")
      .send({ email, password, username: userData.username });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("refreshToken");

    userData.token = response.body.token;
    userData.refreshToken = response.body.refreshToken;
    userData._id = response.body._id;
  });

  test("Duplicate registration (same email) should fail", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({ email: userData.email, password: "password123", username: "another" });

    expect([409, 400, 500]).toContain(response.status);
  });

  test("Create post with valid token succeeds", async () => {
    const postData = postsList[0];
    const response = await request(app)
      .post("/posts")
      .set("Authorization", "Bearer " + userData.token)
      .send(postData);

    expect(response.status).toBe(201);
  });

  test("Create post with compromised token fails", async () => {
    const postData = postsList[0];
    const compromisedToken = userData.token + "a";

    const response = await request(app)
      .post("/posts")
      .set("Authorization", "Bearer " + compromisedToken)
      .send(postData);

    expect(response.status).toBe(401);
  });

  test("Login succeeds", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: userData.email, password: userData.password });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("refreshToken");

    userData.token = response.body.token;
    userData.refreshToken = response.body.refreshToken;
  });

  test("Login with wrong password fails", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: userData.email, password: "wrongpassword" });

    expect(response.status).toBe(401);
  });

  test("Login with non-existing user fails", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "notexists@example.com", password: "password123" });

    expect(response.status).toBe(401);
  });

  jest.setTimeout(10000);

  test("Expired token should fail, refresh should succeed", async () => {
    await new Promise((r) => setTimeout(r, 5000));

    const postData = postsList[0];

    const failedResponse = await request(app)
      .post("/posts")
      .set("Authorization", "Bearer " + userData.token)
      .send(postData);

    expect(failedResponse.status).toBe(401);

    const refreshResponse = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: userData.refreshToken });

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body).toHaveProperty("token");
    expect(refreshResponse.body).toHaveProperty("refreshToken");

    userData.token = refreshResponse.body.token;
    userData.refreshToken = refreshResponse.body.refreshToken;

    const retryResponse = await request(app)
      .post("/posts")
      .set("Authorization", "Bearer " + userData.token)
      .send(postData);

    expect(retryResponse.status).toBe(201);
  });

  test("Refresh with invalid token format fails", async () => {
    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: "not.a.jwt" });

    expect(response.status).toBe(401);
  });

  test("Logout should invalidate refresh token", async () => {
    const logoutResponse = await request(app)
      .post("/auth/logout")
      .send({ refreshToken: userData.refreshToken });

    expect(logoutResponse.status).toBe(200);

    const refreshAfterLogout = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: userData.refreshToken });

    expect(refreshAfterLogout.status).toBe(401);

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: userData.email, password: userData.password });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty("refreshToken");

    userData.token = loginRes.body.token;
    userData.refreshToken = loginRes.body.refreshToken;
  });

  test("Double use of refresh token fails", async () => {
    const refreshResponse1 = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: userData.refreshToken });

    expect(refreshResponse1.status).toBe(200);

    const newRefreshToken = refreshResponse1.body.refreshToken;

    const refreshResponse2 = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: userData.refreshToken });

    expect(refreshResponse2.status).toBe(401);

    const refreshResponse3 = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: newRefreshToken });

    expect(refreshResponse3.status).toBe(401);
  });

  test("getLogedInUser should login when user already exists", async () => {
  const u = {
    email: `u_${Date.now()}@test.com`,
    password: "123456",
    username: `u_${Date.now()}`,
  };

  await request(app).post("/auth/register").send(u).expect(201);

  const me = await getLogedInUser(app, u);

  expect(me.token).toBeTruthy();
});

});
