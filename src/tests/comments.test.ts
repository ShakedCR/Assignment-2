import request from "supertest";
import { Express } from "express";
import mongoose from "mongoose";

import initApp from "../index";
import commentsModel from "../models/commentModel";
import { getLogedInUser, UserData } from "./utils";

let app: Express;
let loginUser: UserData;
let commentId = "";

type CommentData = {
  content: string;
  postId: string;
  _id?: string;
};

const commentsList: CommentData[] = [
  { content: "this is my comment", postId: "507f1f77bcf86cd799439011" },
  { content: "this is my second comment", postId: "507f1f77bcf86cd799439012" },
  { content: "this is my third comment", postId: "507f1f77bcf86cd799439013" },
  { content: "this is my fourth comment", postId: "507f1f77bcf86cd799439013" },
];

beforeAll(async () => {
  process.env.JWT_EXPIRES_IN = "3s";
  process.env.JWT_SECRET = "test_secret";

  app = await initApp();
  await commentsModel.deleteMany();

  loginUser = await getLogedInUser(app, {
    email: "comments@test.com",
    password: "pass123",
    username: "commentsUser",
  });
});

// Test data is cleaned up after execution.
// Disable cleanup (deleteMany) temporarily to view data in MongoDB Compass.
afterAll(async () => {
  await commentsModel.deleteMany();
  await mongoose.connection.close();
});

describe("Comments Test Suite", () => {
  test("Initial empty comments", async () => {
    const response = await request(app).get("/comment");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("Create comment without token fails", async () => {
    const response = await request(app).post("/comment").send(commentsList[0]);
    expect(response.status).toBe(401);
  });

  test("Create comment with invalid token fails", async () => {
    const response = await request(app)
      .post("/comment")
      .set("Authorization", "Bearer " + loginUser.token + "x")
      .send(commentsList[0]);

    expect(response.status).toBe(401);
  });

  test("Create Comment", async () => {
    for (const comment of commentsList) {
      const response = await request(app)
        .post("/comment")
        .set("Authorization", "Bearer " + loginUser.token)
        .send(comment);

      expect(response.status).toBe(201);
      expect(response.body.content).toBe(comment.content);
      expect(response.body.postId).toBe(comment.postId);
    }
  });

  test("Get All Comments", async () => {
    const response = await request(app).get("/comment");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(commentsList.length);
  });

  test("Get Comments by postId", async () => {
    const response = await request(app).get(
      "/comment?postId=" + commentsList[0].postId
    );

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].content).toBe(commentsList[0].content);

    commentId = response.body[0]._id;
    expect(commentId).toBeTruthy();
  });

  test("Get Comment by ID", async () => {
    const response = await request(app).get("/comment/" + commentId);

    expect(response.status).toBe(200);
    expect(response.body.content).toBe(commentsList[0].content);
    expect(response.body.postId).toBe(commentsList[0].postId);
    expect(response.body._id).toBe(commentId);
  });

  test("Get Comment by non-existing ID returns 404", async () => {
    const response = await request(app).get("/comment/507f1f77bcf86cd799439099");
    expect(response.status).toBe(404);
  });

  test("Update comment without token fails", async () => {
    const response = await request(app)
      .put("/comment/" + commentId)
      .send({ content: "x" });

    expect(response.status).toBe(401);
  });

  test("Update Comment", async () => {
    const updated: CommentData = {
      content: "This is an updated comment",
      postId: "507f1f77bcf86cd799439044",
    };

    const response = await request(app)
      .put("/comment/" + commentId)
      .set("Authorization", "Bearer " + loginUser.token)
      .send(updated);

    expect(response.status).toBe(200);
    expect(response.body.content).toBe(updated.content);
    expect(response.body.postId).toBe(updated.postId);
    expect(response.body._id).toBe(commentId);
  });

  test("Update non-existing comment returns 404", async () => {
    const response = await request(app)
      .put("/comment/507f1f77bcf86cd799439099")
      .set("Authorization", "Bearer " + loginUser.token)
      .send({ content: "x", postId: "507f1f77bcf86cd799439011" });

    expect(response.status).toBe(404);
  });

  test("Delete comment without token fails", async () => {
    const response = await request(app).delete("/comment/" + commentId);
    expect(response.status).toBe(401);
  });

  test("Delete Comment", async () => {
    const response = await request(app)
      .delete("/comment/" + commentId)
      .set("Authorization", "Bearer " + loginUser.token);

    expect(response.status).toBe(200);
    expect(response.body._id).toBe(commentId);

    const getResponse = await request(app).get("/comment/" + commentId);
    expect(getResponse.status).toBe(404);
  });

  test("Delete non-existing comment returns 404", async () => {
    const response = await request(app)
      .delete("/comment/507f1f77bcf86cd799439099")
      .set("Authorization", "Bearer " + loginUser.token);

    expect(response.status).toBe(404);
  });
});
