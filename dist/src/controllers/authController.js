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
exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const jwt_helper_1 = require("../../helpers/jwt_helper");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const validationShema_1 = require("../../helpers/validationShema");
const prisma = new client_1.PrismaClient();
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield validationShema_1.authSchema.validate(req.body);
        // Check if user already exists
        const doesExist = yield prisma.users.findUnique({
            where: { email: result.email },
        });
        if (doesExist) {
            throw http_errors_1.default.Conflict(`${result.email} is already registered`);
        }
        // Hash the password before saving
        const hashedPassword = yield bcryptjs_1.default.hash(result.password, 10);
        const user = yield prisma.users.create({
            data: {
                name: result.name,
                email: result.email,
                password: hashedPassword,
            },
        });
        const accessToken = yield (0, jwt_helper_1.signAccessToken)(user.userId);
        const refreshToken = yield (0, jwt_helper_1.signRefreshToken)(user.userId);
        res.send({ accessToken, refreshToken });
    }
    catch (error) {
        // if (error.isJoi === true) error.status = 422;
        next(error);
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield validationShema_1.authSchema.validate(req.body);
        // Find user by email
        const user = yield prisma.users.findUnique({
            where: { email: result.email },
        });
        // If user not found
        if (!user)
            throw new Error('incorrect email');
        // Validate if the user password is not null before comparison
        if (!user.password) {
            throw new Error('input password');
        }
        // Validate password
        const isMatch = bcryptjs_1.default.compare(result.password, user.password);
        if (!isMatch) {
            throw http_errors_1.default.Unauthorized('Username/password not valid');
        }
        const accessToken = yield (0, jwt_helper_1.signAccessToken)(user.userId);
        const refreshToken = yield (0, jwt_helper_1.signRefreshToken)(user.userId);
        res.send({ accessToken, refreshToken });
    }
    catch (error) {
        // if (error.isJoi === true) {
        //   return next(createError.BadRequest('Invalid Username/Password'));
        // }
        next(error);
    }
});
exports.login = login;
const refreshToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken)
            throw http_errors_1.default.BadRequest();
        const userId = yield (0, jwt_helper_1.verifyRefreshToken)(refreshToken);
        const accessToken = yield (0, jwt_helper_1.signAccessToken)(userId);
        const newRefreshToken = yield (0, jwt_helper_1.signRefreshToken)(userId);
        res.send({ accessToken, refreshToken: newRefreshToken });
    }
    catch (error) {
        next(error);
    }
});
exports.refreshToken = refreshToken;
const logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken)
            throw http_errors_1.default.BadRequest();
        const userId = yield (0, jwt_helper_1.verifyRefreshToken)(refreshToken);
        // Delete the refresh token from Redis
        // client.DEL(userId, (err, val) => {
        //   if (err) {
        //     console.log(err.message);
        //     throw createError.InternalServerError();
        //   }
        //   console.log(val);
        //   res.sendStatus(204);
        // });
    }
    catch (error) {
        next(error);
    }
});
exports.logout = logout;
