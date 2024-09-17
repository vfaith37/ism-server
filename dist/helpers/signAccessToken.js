"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_errors_1 = __importDefault(require("http-errors"));
// Define the function that signs the access token
const signAccessToken = (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {}; // Empty payload for now
        const secret = process.env.ACCESS_TOKEN_SECRET_KEY;
        const options = {
            expiresIn: '1h', // Token expires in 1 hour
            issuer: 'FigoSavic', // The issuer of the token
            audience: userId, // The audience (userId)
        };
        jsonwebtoken_1.default.sign(payload, secret, options, (error, token) => {
            if (error) {
                console.error(error.message); // Log the error message
                return reject(http_errors_1.default.InternalServerError()); // Reject with an internal server error
            }
            resolve(token); // Resolve the generated token
        });
    });
};
exports.signAccessToken = signAccessToken;
