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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getData = exports.setData = void 0;
const redis_1 = require("redis");
// Create a Redis client
const client = (0, redis_1.createClient)({
    url: 'redis://127.0.0.1:6379', // Using the URL format is preferred
});
// Connect to Redis
client.on('connect', () => {
    console.log('Client connected to Redis...');
});
client.on('ready', () => {
    console.log('Client connected to Redis and ready to use...');
});
client.on('error', (err) => {
    console.error('Redis Client Error', err);
});
client.on('end', () => {
    console.log('Client disconnected from Redis');
});
// Handle process termination
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    yield client.quit();
}));
// Export the Redis client
exports.default = client;
const setData = (key, value, expiration) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.set(key, value, { EX: expiration });
        console.log(`Data set: ${key} = ${value} (expires in ${expiration} seconds)`);
    }
    catch (err) {
        console.error('Error setting data in Redis:', err);
    }
});
exports.setData = setData;
const getData = (key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const value = yield client.get(key);
        if (value !== null) {
            console.log(`Data retrieved: ${key} = ${value}`);
            return value;
        }
        else {
            console.log(`No data found for key: ${key}`);
            return null;
        }
    }
    catch (err) {
        console.error('Error getting data from Redis:', err);
        return null;
    }
});
exports.getData = getData;
