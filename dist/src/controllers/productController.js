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
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProducts = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const search = (_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toString();
        const products = yield prisma.products.findMany({
            where: {
                name: {
                    contains: search
                }
            }
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving products" });
    }
});
exports.getProducts = getProducts;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, price, rating, stockQuantity } = req.body;
        // Check if the product already exists
        const existingProduct = yield prisma.products.findFirst({
            where: { name },
        });
        if (existingProduct) {
            res.status(409).json({ message: 'Product already exists' });
            return;
        }
        const product = yield prisma.products.create({
            data: {
                name,
                price,
                rating,
                stockQuantity
            }
        });
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({ message: "Error adding product" });
    }
});
exports.createProduct = createProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        const { stockQuantity, price, rating, name } = req.body;
        // Check if productId is provided
        if (!productId) {
            res.status(400).json({ message: "Product ID is required" });
            return;
        }
        // Check if the product exists
        const product = yield prisma.products.findUnique({
            where: { productId }
        });
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        const updatedProduct = yield prisma.products.update({
            where: { productId },
            data: {
                name: name !== null && name !== void 0 ? name : product.name,
                price: price !== null && price !== void 0 ? price : product.price,
                rating: rating !== null && rating !== void 0 ? rating : product.rating,
                stockQuantity: stockQuantity !== null && stockQuantity !== void 0 ? stockQuantity : product.stockQuantity,
                updatedAt: new Date() // Set the updatedAt field to current date/time
            }
        });
        res.status(201).json(updatedProduct);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating product" });
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        // Check if productId is provided
        if (!productId) {
            res.status(400).json({ message: "Product ID is required" });
            return;
        }
        //Check if the product exists
        const product = yield prisma.products.findUnique({
            where: { productId }
        });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        const deletedProduct = yield prisma.products.delete({
            where: { productId }
        });
        res.status(200).json({
            "message": "Product deleted successfully",
            deletedProduct,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting product" });
    }
});
exports.deleteProduct = deleteProduct;
