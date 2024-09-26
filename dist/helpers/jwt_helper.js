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
exports.verifyRefreshToken = exports.signRefreshToken = exports.verifyAccessToken = exports.signAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_errors_1 = __importDefault(require("http-errors"));
const init_redis_1 = require("./init_redis");
// Function to sign access token
const signAccessToken = (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {};
        const secret = process.env.ACCESS_TOKEN_SECRET; // Type assertion
        const options = {
            expiresIn: '1h',
            issuer: 'pickurpage.com',
            audience: userId,
        };
        jsonwebtoken_1.default.sign(payload, secret, options, (err, token) => {
            if (err) {
                console.log(err.message);
                reject(http_errors_1.default.InternalServerError());
                return;
            }
            resolve(token); // Type assertion to string
        });
    });
};
exports.signAccessToken = signAccessToken;
// Middleware to verify access token
const verifyAccessToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader)
        return next(http_errors_1.default.Unauthorized());
    const bearerToken = authHeader.split(' ');
    const token = bearerToken[1];
    jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
            const message = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
            return next(http_errors_1.default.Unauthorized(message));
        }
        req.payload = payload; // Type assertion
        next();
    });
};
exports.verifyAccessToken = verifyAccessToken;
// Function to sign refresh token
const signRefreshToken = (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {};
        const secret = process.env.REFRESH_TOKEN_SECRET; // Type assertion
        const options = {
            expiresIn: '1y',
            issuer: 'pickurpage.com',
            audience: userId,
        };
        jsonwebtoken_1.default.sign(payload, secret, options, (err, token) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.log(err.message);
                reject(http_errors_1.default.InternalServerError());
                return;
            }
            // Set the refresh token in Redis with an expiration time
            yield (0, init_redis_1.setData)(userId, token, 365 * 24 * 60 * 60); // Set expiry to 1 year
            resolve(token); // Type assertion to string
        }));
    });
};
exports.signRefreshToken = signRefreshToken;
// Function to verify refresh token
const verifyRefreshToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => __awaiter(void 0, void 0, void 0, function* () {
            if (err)
                return reject(http_errors_1.default.Unauthorized());
            const tokenPayload = payload; // Type assertion
            const userId = tokenPayload.aud;
            if (!userId)
                return reject(http_errors_1.default.Unauthorized());
            // Get the refresh token from Redis and compare
            const tokenFromRedis = yield (0, init_redis_1.getData)(userId);
            if (refreshToken !== tokenFromRedis)
                return reject(http_errors_1.default.Unauthorized());
            resolve(userId);
        }));
    });
};
exports.verifyRefreshToken = verifyRefreshToken;
