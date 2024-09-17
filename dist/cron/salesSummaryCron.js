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
const node_cron_1 = __importDefault(require("node-cron"));
const client_1 = require("@prisma/client");
const salesAggregator_1 = require("../utils/salesAggregator");
const prisma = new client_1.PrismaClient();
node_cron_1.default.schedule('0 0 * * 0', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { weeklySales, monthlySales, yearlySales } = yield (0, salesAggregator_1.aggregateSales)();
        // Insert into your weekly summary table
        if (weeklySales.length > 0) {
            console.log(weeklySales);
            yield prisma.weeklySummary.createMany({
                data: weeklySales.map(sale => ({
                    week: sale.week,
                    totalAmount: sale.totalamount // Ensure correct property names
                })),
                skipDuplicates: false // Optional: Skip duplicates if you don't want to insert already existing records
            });
        }
        // Insert into your monthly summary table
        if (monthlySales.length > 0) {
            yield prisma.monthlySummary.createMany({
                data: monthlySales.map(sale => ({
                    month: sale.month,
                    totalAmount: sale.totalamount // Ensure correct property names
                })),
                skipDuplicates: true // Optional: Skip duplicates if you don't want to insert already existing records
            });
        }
        // Insert into your yearly summary table
        if (yearlySales.length > 0) {
            yield prisma.yearlySummary.createMany({
                data: yearlySales.map(sale => ({
                    year: sale.year,
                    totalAmount: sale.totalamount // Ensure correct property names
                })),
                skipDuplicates: true // Optional: Skip duplicates if you don't want to insert already existing records
            });
        }
        console.log('Sales summaries added successfully.');
    }
    catch (error) {
        console.error('Error adding sales summaries:', error);
    }
}));
