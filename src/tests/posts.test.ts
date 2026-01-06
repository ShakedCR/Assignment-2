import request from "supertest";
import initApp from "../index";
import { Express } from "express";
import mongoose from "mongoose";
import postModel from "../models/postModel";
import { getLogedInUser, UserData, postsList, PostData } from "./utils";

let app: Express;
let loginUser: UserData;
let postId = "";

beforeAll(async () => {
  process.env.JWT_EXPIRES_IN = "3s";
  process.env.JWT_SECRET = "test_secret";

  app = await initApp();
  await postModel.deleteMany();
  loginUser = await getLogedInUser(app);
});

// Test data is cleaned up after execution.
// Disable cleanup (deleteMany) temporarily to view data in MongoDB Compass.
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

  test("Create Posts", async () => {
    for (const post of postsList) {
      const response = await request(app)
        .post("/posts")
        .set("Authorization", "Bearer " + loginUser.token)
        .send(post);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(post.title);
      expect(response.body.content).toBe(post.content);
      postId = response.body._id;
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

  test("Update Post", async () => {
    const updated: PostData = {
      title: "Post Updated",
      content: "Updated content",
    };

    const response = await request(app)
      .put("/posts/" + postId)
      .set("Authorization", "Bearer " + loginUser.token)
      .send(updated);

    expect(response.status).toBe(200);
    expect(response.body.title).toBe(updated.title);
    expect(response.body.content).toBe(updated.content);
    expect(response.body._id).toBe(postId);
  });
  

  
  test("Delete Post", async () => {
    const response = await request(app)
      .delete("/posts/" + postId)
      .set("Authorization", "Bearer " + loginUser.token);

    expect(response.status).toBe(200);
    expect(response.body._id).toBe(postId);

    const getResponse = await request(app).get("/posts/" + postId);
    expect(getResponse.status).toBe(404);
  });
});
