import request from "supertest";
import { Express } from "express";
import mongoose from "mongoose";

import initApp from "../index";
import postModel from "../models/postModel";
import User from "../models/userModel";
import { getLogedInUser, UserData } from "./utils";

let app: Express;
let user1: UserData;
let user2: UserData;

let postId = "";

type PostData = {
  title: string;
  content: string;
  _id?: string;
  createdBy?: string;
};

const postsList: PostData[] = [
  { title: "Post One", content: "Content of post one" },
  { title: "Post Two", content: "Content of post two" },
  { title: "Post Three", content: "Content of post three" },
];

beforeAll(async () => {
  process.env.JWT_EXPIRES_IN = "3s";
  process.env.JWT_SECRET = "test_secret";

  app = await initApp();
  await postModel.deleteMany();
  await User.deleteMany();

  user1 = await getLogedInUser(app, {
    email: "user1@test.com",
    password: "pass123",
    username: "user1",
  });

  user2 = await getLogedInUser(app, {
    email: "user2@test.com",
    password: "pass123",
    username: "user2",
  });
});

afterAll(async () => {

  await postModel.deleteMany();
  await mongoose.connection.close();
});

describe("Posts Test Suite", () => {
  test("Initial empty posts", async () => {
    const response = await request(app).get("/posts");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("Create post without token fails (401)", async () => {
    const response = await request(app).post("/posts").send(postsList[0]);
    expect(response.status).toBe(401);
  });

  test("Create Posts", async () => {
    for (const post of postsList) {
      const response = await request(app)
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
  });

  test("Get All Posts", async () => {
    const response = await request(app).get("/posts");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(postsList.length);
  });

  test("Get Post by ID", async () => {
    const response = await request(app).get("/posts/" + postId);
    expect(response.status).toBe(200);
    expect(response.body._id).toBe(postId);
  });

  test("Get Post by ID - not found (404)", async () => {
    const response = await request(app).get("/posts/507f1f77bcf86cd799439099");
    expect(response.status).toBe(404);
  });

  test("Update post without token fails (401)", async () => {
    const response = await request(app)
      .put("/posts/" + postId)
      .send({ title: "x", content: "y" });

    expect(response.status).toBe(401);
  });

  test("Update Post by non-creator fails (403)", async () => {
    const response = await request(app)
      .put("/posts/" + postId)
      .set("Authorization", "Bearer " + user2.token)
      .send({ title: "hacker", content: "hacker content" });

    expect(response.status).toBe(403);
    expect(response.text).toBe("Forbidden: You are not the creator of this post");
  });

  test("Update Post cannot change createdBy (400)", async () => {
    const response = await request(app)
      .put("/posts/" + postId)
      .set("Authorization", "Bearer " + user1.token)
      .send({ createdBy: "507f1f77bcf86cd799439055" });

    expect(response.status).toBe(400);
    expect(response.text).toBe("Cannot change creator of the post");
  });

  test("Update Post - not found (404)", async () => {
    const response = await request(app)
      .put("/posts/507f1f77bcf86cd799439099")
      .set("Authorization", "Bearer " + user1.token)
      .send({ title: "new", content: "new content" });

    expect(response.status).toBe(404);
  });

  test("Update Post", async () => {
    const updated: PostData = {
      title: "Post Updated",
      content: "Updated content",
    };

    const response = await request(app)
      .put("/posts/" + postId)
      .set("Authorization", "Bearer " + user1.token)
      .send(updated);

    expect(response.status).toBe(200);
    expect(response.body.title).toBe(updated.title);
    expect(response.body.content).toBe(updated.content);
    expect(response.body._id).toBe(postId);
    expect(response.body).toHaveProperty("createdBy");
  });

  test("Delete post without token fails (401)", async () => {
    const response = await request(app).delete("/posts/" + postId);
    expect(response.status).toBe(401);
  });

  test("Delete Post by non-creator fails (403)", async () => {
    const response = await request(app)
      .delete("/posts/" + postId)
      .set("Authorization", "Bearer " + user2.token);

    expect(response.status).toBe(403);
    expect(response.text).toBe("Forbidden: You are not the creator of this post");
  });

  test("Delete Post - not found (404)", async () => {
    const response = await request(app)
      .delete("/posts/507f1f77bcf86cd799439099")
      .set("Authorization", "Bearer " + user1.token);

    expect(response.status).toBe(404);
  });

  test("Delete Post", async () => {
    const response = await request(app)
      .delete("/posts/" + postId)
      .set("Authorization", "Bearer " + user1.token);

    expect(response.status).toBe(200);
    expect(response.body._id).toBe(postId);

    const getResponse = await request(app).get("/posts/" + postId);
    expect(getResponse.status).toBe(404);
  });
});
