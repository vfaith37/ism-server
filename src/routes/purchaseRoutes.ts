import { Router } from "express";
import { createSales } from "../controllers/purchaseController";

const router = Router();

router.post("/", createSales);

export default router;