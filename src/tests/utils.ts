import request from "supertest";
import { Express } from "express";

export type UserData = {
  email: string;
  password: string;
  username: string;
  _id: string;
  token: string;
  refreshToken: string;
};

export const userData: UserData = {
  email: "test@test.com",
  password: "testpass",
  username: "testuser",
  _id: "",
  token: "",
  refreshToken: "",
};

export const getLogedInUser = async (app: Express): Promise<UserData> => {
  const email = userData.email;
  const password = userData.password;
  const username = userData.username;

  let response = await request(app).post("/auth/register").send({
    email,
    password,
    username,
  });

  if (response.status !== 201) {
    response = await request(app).post("/auth/login").send({
      email,
      password,
    });
  }

  const logedUser: UserData = {
    _id: response.body._id,
    token: response.body.token,
    refreshToken: response.body.refreshToken,
    email,
    password,
    username,
  };

  return logedUser;
};

export type PostData = {
  title: string;
  content: string;
  _id?: string;
};

export const postsList: PostData[] = [
  { title: "Post One", content: "Content of post one" },
  { title: "Post Two", content: "Content of post two" },
  { title: "Post Three", content: "Content of post three" },
];
