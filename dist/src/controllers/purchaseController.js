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
exports.createSales = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createSales = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId, quantity } = req.body;
        // Find the product by productId
        const product = yield prisma.products.findUnique({
            where: { productId },
        });
        console.log(product);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        // Check if there is enough stock
        if (product.stockQuantity < quantity) {
            res.status(400).json({ message: 'Not enough stock available' });
            return;
        }
        // Calculate the total amount of the sale
        const totalAmount = product.price * quantity;
        // Perform the transaction: update stock, create sale record, and update sales summary
        yield prisma.$transaction([
            // Update the product's stock
            prisma.products.update({
                where: { productId },
                data: {
                    stockQuantity: product.stockQuantity - quantity,
                },
            }),
            // Create a new record in the Sales table (auto-generating saleId as UUID)
            prisma.sales.create({
                data: {
                    timestamp: new Date(),
                    quantity,
                    unitPrice: product.price,
                    totalAmount,
                    product: {
                        connect: { productId: product.productId },
                    },
                },
            }),
        ]);
        res.status(200).json({ message: 'Purchase successful' });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error retrieving products" });
    }
});
exports.createSales = createSales;
