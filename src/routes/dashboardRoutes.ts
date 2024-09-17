import { Router } from "express";
import { getDashboardMetric } from "../controllers/dashboardController";



const router = Router();

router.get("/", getDashboardMetric)

export default router