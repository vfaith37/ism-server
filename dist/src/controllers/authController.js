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
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const validationShema_1 = require("../../helpers/validationShema");
const signAccessToken_1 = require("../../helpers/signAccessToken");
const prisma = new client_1.PrismaClient();
// User Registration
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    try {
        // Validate request body using authSchema
        yield validationShema_1.authSchema.validate(req.body);
        // Check if the user already exists
        const existingUser = yield prisma.users.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Hash the password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Create the new user
        const newUser = yield prisma.users.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
        // Sign JWT token
        const token = (0, signAccessToken_1.signAccessToken)(newUser.userId);
        return res.status(201).json({ message: 'User registered', token });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
exports.register = register;
// User Login
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Validate request body using signInSchema
        yield validationShema_1.signInSchema.validate(req.body);
        // Find user by email
        const user = yield prisma.users.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        if (user.password) {
            // Compare passwords
            const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }
        }
        // Sign JWT token
        const token = (0, signAccessToken_1.signAccessToken)(user.userId);
        return res.status(200).json({ message: 'Login successful', token });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
exports.login = login;
