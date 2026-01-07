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

export const getLogedInUser = async (
  app: Express,
  user: { email: string; password: string; username: string } = userData
): Promise<UserData> => {
  const { email, password, username } = user;

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

  const token =
    response.body?.token ??
    response.body?.accessToken ??
    response.body?.access_token ??
    response.body?.data?.token ??
    response.body?.data?.accessToken ??
    "";

  return {
    _id: response.body?._id ?? "",
    token,
    refreshToken: response.body?.refreshToken ?? "",
    email,
    password,
    username,
  };
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
