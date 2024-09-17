import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";


const prisma = new PrismaClient();

// Define the type for request parameters
interface ProductParams {
	productId: string;
		}

export const getProducts = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const search = req.query.search?.toString();

		const products = await prisma.products.findMany({
			where: {
				name: {
					contains: search
				}
				}
		})
		res.json(products)
	} catch (error) {
		res.status(500).json({message: "Error retrieving products"})
	}
}

export const createProduct = async(
	req: Request,
	res: Response
): Promise<void> => {
	try {

		const {name, price, rating, stockQuantity} = req.body

		// Check if the product already exists
		const existingProduct = await prisma.products.findFirst({
			where: { name },
				});

				if (existingProduct) {
			res.status(409).json({ message: 'Product already exists' });
			return;
				}

		const product = await prisma.products.create({
			data: {
				name,
				price,
				rating,
				stockQuantity
			}
		});
		res.status(201).json(product); 
	} catch (error) {
	res.status(500).json({message: "Error adding product"})
	}
}

export const updateProduct = async(req: Request<ProductParams>, res: Response):Promise<void> => {
	try {
		const {productId} = req.params;
		const { stockQuantity, price, rating, name} = req.body;

		// Check if productId is provided
		if (!productId) {
			res.status(400).json({ message: "Product ID is required" });
			return;
		}

		// Check if the product exists
		const product = await prisma.products.findUnique({
			where: { productId }
		});

		if (!product) {
			res.status(404).json({ message: 'Product not found' });
			return;
		}
		const updatedProduct = await prisma.products.update({
			where: { productId },
			data: {
				name: name ?? product.name,
				price: price ?? product.price,
				rating: rating ?? product.rating,
				stockQuantity: stockQuantity ?? product.stockQuantity,
				updatedAt: new Date() // Set the updatedAt field to current date/time
			}
		})

		res.status(201).json(updatedProduct);
	} catch (error) {
		res.status(500).json({message: "Error updating product"})
	}
}

export const deleteProduct = async(req:Request<ProductParams>, res:Response):Promise<void> => {
	try {
		const {productId} = req.params;

		// Check if productId is provided
		if (!productId) {
			res.status(400).json({ message: "Product ID is required" });
			return;
		}

		//Check if the product exists
		const product = await prisma.products.findUnique({
			where: {productId}
		})

		if(!product){
			res.status(404).json({message: "Product not found"});
			return;
		}

		const deletedProduct = await prisma.products.delete({
			where: {productId}
		})

		res.status(200).json(
			{
			"message": "Product deleted successfully",
			deletedProduct,
		})
	} catch (error) {
		console.log(error);

		res.status(500).json({message: "Error deleting product"})
	}
}
