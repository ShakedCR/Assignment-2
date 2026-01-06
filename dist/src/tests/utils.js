"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postsList = exports.getLogedInUser = exports.userData = void 0;
const supertest_1 = __importDefault(require("supertest"));
exports.userData = {
    email: "test@test.com",
    password: "testpass",
    username: "testuser",
    _id: "",
    token: "",
    refreshToken: "",
};
const getLogedInUser = (app) => __awaiter(void 0, void 0, void 0, function* () {
    const email = exports.userData.email;
    const password = exports.userData.password;
    const username = exports.userData.username;
    let response = yield (0, supertest_1.default)(app).post("/auth/register").send({
        email,
        password,
        username,
    });
    if (response.status !== 201) {
        response = yield (0, supertest_1.default)(app).post("/auth/login").send({
            email,
            password,
        });
    }
    const logedUser = {
        _id: response.body._id,
        token: response.body.token,
        refreshToken: response.body.refreshToken,
        email,
        password,
        username,
    };
    return logedUser;
});
exports.getLogedInUser = getLogedInUser;
exports.postsList = [
    { title: "Post One", content: "Content of post one" },
    { title: "Post Two", content: "Content of post two" },
    { title: "Post Three", content: "Content of post three" },
];
//# sourceMappingURL=utils.js.map