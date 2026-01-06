import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Posts & Comments API",
      version: "1.0.0",
      description: "A RESTful API for managing posts and comments with user authentication",
      contact: {
        name: "Shaked",
        email: "developer@example.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT Bearer token",
        },
      },
      schemas: {
        Post: {
          type: "object",
          required: ["title", "content"],
          properties: {
            _id: {
              type: "string",
              description: "Post ID (MongoDB ObjectId)",
              example: "507f1f77bcf86cd799439011",
            },
            title: {
              type: "string",
              description: "Post title",
              example: "Post One",
            },
            content: {
              type: "string",
              description: "Post content",
              example: "Content of post one",
            },
            createdBy: {
              type: "string",
              description: "ID of the user who created the post",
              example: "507f1f77bcf86cd799439012",
            },
          },
        },
        User: {
          type: "object",
          required: ["email", "password"],
          properties: {
            _id: {
              type: "string",
              description: "User ID (MongoDB ObjectId)",
              example: "507f1f77bcf86cd799439012",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "user@example.com",
            },
            password: {
              type: "string",
              description: "User password (hashed)",
              example: "password123",
            },
          },
        },
        Comment: {
          type: "object",
          required: ["content", "postId"],
          properties: {
            _id: {
              type: "string",
              description: "Comment ID (MongoDB ObjectId)",
              example: "507f1f77bcf86cd799439013",
            },
            content: {
              type: "string",
              description: "Comment content",
              example: "Great post!",
            },
            postId: {
              type: "string",
              description: "ID of the post being commented on",
              example: "507f1f77bcf86cd799439011",
            },
            userId: {
              type: "string",
              description: "ID of the user who wrote the comment",
              example: "507f1f77bcf86cd799439012",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "User email",
              example: "user@example.com",
            },
            password: {
              type: "string",
              description: "User password",
              example: "password123",
            },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["email", "password", "username"],
          properties: {
            username: {
              type: "string",
              description: "Username",
              example: "shaked",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email",
              example: "user@example.com",
            },
            password: {
              type: "string",
              minLength: 6,
              description: "User password (minimum 6 characters)",
              example: "password123",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            token: {
              type: "string",
              description: "JWT access token",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            refreshToken: {
              type: "string",
              description: "JWT refresh token",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        RefreshTokenRequest: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: {
              type: "string",
              description: "JWT refresh token",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        LogoutRequest: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: {
              type: "string",
              description: "JWT refresh token to invalidate",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Error message",
              example: "An error occurred",
            },
            status: {
              type: "number",
              description: "HTTP status code",
              example: 400,
            },
          },
        },
      },
    },
    tags: [
      { name: "Authentication", description: "User authentication and authorization endpoints" },
      { name: "Posts", description: "Post management endpoints" },
      { name: "Comments", description: "Comment management endpoints" },
    ],
  },
  apis: [],
};

const manualPaths = {
  "/auth/register": {
    post: {
      tags: ["Authentication"],
      summary: "Register a new user",
      description: "Create a new user account with email, password, and username",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RegisterRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "User registered successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthResponse" },
            },
          },
        },
        400: { description: "Invalid input data" },
        409: { description: "User already exists" },
      },
    },
  },
  "/auth/login": {
    post: {
      tags: ["Authentication"],
      summary: "Login user",
      description: "Authenticate user and return JWT tokens",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/LoginRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Login successful",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthResponse" },
            },
          },
        },
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
        200: {
          description: "Token refreshed successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthResponse" },
            },
          },
        },
        401: { description: "Invalid refresh token" },
        400: { description: "Refresh token is required" },
      },
    },
  },
  "/auth/logout": {
    post: {
      tags: ["Authentication"],
      summary: "Logout user",
      description: "Invalidate a refresh token",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/LogoutRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Logged out successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Logged out successfully" },
                },
              },
            },
          },
        },
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
        200: {
          description: "List of posts",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/Post" },
              },
            },
          },
        },
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
            schema: {
              type: "object",
              required: ["title", "content"],
              properties: {
                title: { type: "string" },
                content: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Post created successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Post" },
            },
          },
        },
        401: { description: "Unauthorized" },
      },
    },
  },
  "/posts/{id}": {
    get: {
      tags: ["Posts"],
      summary: "Get post by ID",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Post details",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Post" } } },
        },
        404: { description: "Post not found" },
      },
    },
    put: {
      tags: ["Posts"],
      summary: "Update a post",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                content: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Post updated successfully" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Not the post creator" },
        404: { description: "Post not found" },
      },
    },
    delete: {
      tags: ["Posts"],
      summary: "Delete a post",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Post deleted successfully" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Not the post creator" },
        404: { description: "Post not found" },
      },
    },
  },
  "/comment": {
    get: {
      tags: ["Comments"],
      summary: "Get all comments",
      parameters: [
        {
          name: "postId",
          in: "query",
          schema: { type: "string" },
          description: "Filter by post ID",
        },
      ],
      responses: {
        200: {
          description: "List of comments",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/Comment" },
              },
            },
          },
        },
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
            schema: {
              type: "object",
              required: ["content", "postId"],
              properties: {
                content: { type: "string" },
                postId: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Comment created successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Comment" },
            },
          },
        },
        401: { description: "Unauthorized" },
      },
    },
  },
  "/comment/{id}": {
    get: {
      tags: ["Comments"],
      summary: "Get comment by ID",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Comment details",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Comment" } } },
        },
        404: { description: "Comment not found" },
      },
    },
    put: {
      tags: ["Comments"],
      summary: "Update a comment",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                content: { type: "string" },
                postId: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Comment updated successfully" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Not the comment creator" },
        404: { description: "Comment not found" },
      },
    },
    delete: {
      tags: ["Comments"],
      summary: "Delete a comment",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Comment deleted successfully" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Not the comment creator" },
        404: { description: "Comment not found" },
      },
    },
  },
};

const completeOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: options.definition!.info!,
    servers: options.definition!.servers,
    components: options.definition!.components,
    tags: options.definition!.tags,
    paths: manualPaths,
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(completeOptions);

export { swaggerUi, swaggerSpec };
