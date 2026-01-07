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
const getLogedInUser = (app_1, ...args_1) => __awaiter(void 0, [app_1, ...args_1], void 0, function* (app, user = exports.userData) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    const { email, password, username } = user;
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
    const token = (_m = (_j = (_f = (_d = (_b = (_a = response.body) === null || _a === void 0 ? void 0 : _a.token) !== null && _b !== void 0 ? _b : (_c = response.body) === null || _c === void 0 ? void 0 : _c.accessToken) !== null && _d !== void 0 ? _d : (_e = response.body) === null || _e === void 0 ? void 0 : _e.access_token) !== null && _f !== void 0 ? _f : (_h = (_g = response.body) === null || _g === void 0 ? void 0 : _g.data) === null || _h === void 0 ? void 0 : _h.token) !== null && _j !== void 0 ? _j : (_l = (_k = response.body) === null || _k === void 0 ? void 0 : _k.data) === null || _l === void 0 ? void 0 : _l.accessToken) !== null && _m !== void 0 ? _m : "";
    return {
        _id: (_p = (_o = response.body) === null || _o === void 0 ? void 0 : _o._id) !== null && _p !== void 0 ? _p : "",
        token,
        refreshToken: (_r = (_q = response.body) === null || _q === void 0 ? void 0 : _q.refreshToken) !== null && _r !== void 0 ? _r : "",
        email,
        password,
        username,
    };
});
exports.getLogedInUser = getLogedInUser;
exports.postsList = [
    { title: "Post One", content: "Content of post one" },
    { title: "Post Two", content: "Content of post two" },
    { title: "Post Three", content: "Content of post three" },
];
//# sourceMappingURL=utils.js.map