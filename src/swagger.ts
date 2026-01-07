import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const manualPaths = {
  "/auth/register": {
    post: {
      tags: ["Authentication"],
      summary: "Register a new user",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RegisterRequest" },
          },
        },
      },
      responses: {
        201: { description: "User registered successfully" },
        400: { description: "Invalid input" },
        409: { description: "User already exists" },
      },
    },
  },
  "/auth/login": {
    post: {
      tags: ["Authentication"],
      summary: "Login user",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/LoginRequest" },
          },
        },
      },
      responses: {
        200: { description: "Login successful" },
        401: { description: "Invalid credentials" },
      },
    },
  },
  "/auth/refresh": {
    post: {
      tags: ["Authentication"],
      summary: "Refresh access token",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RefreshTokenRequest" },
          },
        },
      },
      responses: {
        200: { description: "Token refreshed successfully" },
        400: { description: "Refresh token is required" },
        401: { description: "Invalid refresh token" },
      },
    },
  },
  "/auth/logout": {
    post: {
      tags: ["Authentication"],
      summary: "Logout user",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/LogoutRequest" },
          },
        },
      },
      responses: {
        200: { description: "Logged out successfully" },
        400: { description: "Refresh token is required" },
        401: { description: "Invalid refresh token" },
      },
    },
  },
  "/posts": {
    get: {
      tags: ["Posts"],
      summary: "Get all posts",
      responses: {
        200: { description: "List of posts" },
      },
    },
    post: {
      tags: ["Posts"],
      summary: "Create a new post",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Post" },
          },
        },
      },
      responses: {
        201: { description: "Post created" },
        401: { description: "Unauthorized" },
      },
    },
  },
  "/posts/{id}": {
    get: {
      tags: ["Posts"],
      summary: "Get post by ID",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Post found" },
        404: { description: "Post not found" },
      },
    },
    put: {
      tags: ["Posts"],
      summary: "Update a post",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Post" },
          },
        },
      },
      responses: {
        200: { description: "Post updated" },
        401: { description: "Unauthorized" },
        404: { description: "Post not found" },
      },
    },
    delete: {
      tags: ["Posts"],
      summary: "Delete a post",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Post deleted" },
        401: { description: "Unauthorized" },
        404: { description: "Post not found" },
      },
    },
  },
  "/comment": {
    get: {
      tags: ["Comments"],
      summary: "Get all comments",
      responses: {
        200: { description: "List of comments" },
      },
    },
    post: {
      tags: ["Comments"],
      summary: "Create a new comment",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Comment" },
          },
        },
      },
      responses: {
        201: { description: "Comment created" },
        401: { description: "Unauthorized" },
      },
    },
  },
  "/comment/{id}": {
    get: {
      tags: ["Comments"],
      summary: "Get comment by ID",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Comment found" },
        404: { description: "Comment not found" },
      },
    },
    put: {
      tags: ["Comments"],
      summary: "Update a comment",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Comment" },
          },
        },
      },
      responses: {
        200: { description: "Comment updated" },
        401: { description: "Unauthorized" },
        404: { description: "Comment not found" },
      },
    },
    delete: {
      tags: ["Comments"],
      summary: "Delete a comment",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Comment deleted" },
        401: { description: "Unauthorized" },
        404: { description: "Comment not found" },
      },
    },
  },
  "/users": {
    get: {
      tags: ["Users"],
      summary: "Get all users",
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "List of users" },
        401: { description: "Unauthorized" },
      },
    },
    post: {
      tags: ["Users"],
      summary: "Create a new user",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RegisterRequest" },
          },
        },
      },
      responses: {
        201: { description: "User created" },
        400: { description: "Invalid input" },
        409: { description: "User already exists" },
      },
    },
  },
  "/users/{id}": {
    get: {
      tags: ["Users"],
      summary: "Get user by ID",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "User found" },
        401: { description: "Unauthorized" },
        404: { description: "Not found" },
      },
    },
    put: {
      tags: ["Users"],
      summary: "Update a user",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RegisterRequest" },
          },
        },
      },
      responses: {
        200: { description: "User updated" },
        401: { description: "Unauthorized" },
        404: { description: "Not found" },
        409: { description: "Email or username already exists" },
      },
    },
    delete: {
      tags: ["Users"],
      summary: "Delete a user",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "User deleted" },
        401: { description: "Unauthorized" },
        404: { description: "Not found" },
      },
    },
  },
};

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Posts & Comments API",
      version: "1.0.0",
      description: "A RESTful API for managing posts, comments and users with authentication",
      contact: {
        name: "Shaked",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Post: { type: "object" },
        Comment: { type: "object" },
        User: { type: "object" },
        LoginRequest: { type: "object" },
        RegisterRequest: { type: "object" },
        AuthResponse: { type: "object" },
        RefreshTokenRequest: { type: "object" },
        LogoutRequest: { type: "object" },
        Error: { type: "object" },
      },
    },
    tags: [
      { name: "Authentication" },
      { name: "Posts" },
      { name: "Comments" },
      { name: "Users" },
    ],
    paths: manualPaths,
  },
  apis: [],
});

export { swaggerUi, swaggerSpec };
