import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type WeeklySales = {
  week: Date;
  totalamount: number;
};

type MonthlySales = {
  month: Date;
  totalamount: number;
};

type YearlySales = {
  year: number;
  totalamount: number;
};


export const aggregateSales = async () => {
  // Weekly sales aggregation
  const weeklySales = await prisma.$queryRaw<WeeklySales[]>`
    SELECT 
      DATE_TRUNC('week', "timestamp") AS week, 
      SUM("totalAmount") AS totalAmount
    FROM "Sales"
    WHERE "timestamp" >= NOW() - INTERVAL '7 days'
    GROUP BY week
  `;

  // Monthly sales aggregation
  const monthlySales = await prisma.$queryRaw<MonthlySales[]>`
    SELECT 
      DATE_TRUNC('month', "timestamp") AS month, 
      SUM("totalAmount") AS totalAmount
    FROM "Sales"
    WHERE "timestamp" >= NOW() - INTERVAL '1 month'
    GROUP BY month
  `;

  // Yearly sales aggregation
  const yearlySales = await prisma.$queryRaw<YearlySales[]>`
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
};
