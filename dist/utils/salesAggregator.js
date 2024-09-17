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
exports.aggregateSales = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const aggregateSales = () => __awaiter(void 0, void 0, void 0, function* () {
    // Weekly sales aggregation
    const weeklySales = yield prisma.$queryRaw `
    SELECT 
      DATE_TRUNC('week', "timestamp") AS week, 
      SUM("totalAmount") AS totalAmount
    FROM "Sales"
    WHERE "timestamp" >= NOW() - INTERVAL '7 days'
    GROUP BY week
  `;
    // Monthly sales aggregation
    const monthlySales = yield prisma.$queryRaw `
    SELECT 
      DATE_TRUNC('month', "timestamp") AS month, 
      SUM("totalAmount") AS totalAmount
    FROM "Sales"
    WHERE "timestamp" >= NOW() - INTERVAL '1 month'
    GROUP BY month
  `;
    // Yearly sales aggregation
    const yearlySales = yield prisma.$queryRaw `
    SELECT 
      EXTRACT(YEAR FROM "timestamp") AS year, 
      SUM("totalAmount") AS totalAmount
    FROM "Sales"
    WHERE "timestamp" >= NOW() - INTERVAL '1 year'
    GROUP BY year
  `;
    return {
        weeklySales,
        monthlySales,
        yearlySales,
    };
});
exports.aggregateSales = aggregateSales;
