import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";


const prisma = new PrismaClient();

// Define the type for request parameters
interface ProductParams {
	productId: string;
		}

export const createSales = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
        const { productId, quantity } = req.body;
    
        // Find the product by productId
        const product = await prisma.products.findUnique({
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
        await prisma.$transaction([
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

	} catch (error) {
        console.log(error);
        
		res.status(500).json({message: "Error retrieving products"})
	}
}
