import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { aggregateSales } from '../utils/salesAggregator';

const prisma = new PrismaClient();

cron.schedule('0 0 * * 0', async () => { // Runs every 20 seconds
  try {
    const { weeklySales, monthlySales, yearlySales } = await aggregateSales();

    // Insert into your weekly summary table
    if (weeklySales.length > 0) {
      console.log(weeklySales);
      
      await prisma.weeklySummary.createMany({
        data: weeklySales.map(sale => ({
          week: sale.week,
          totalAmount: sale.totalamount // Ensure correct property names
        })),
        skipDuplicates: false // Optional: Skip duplicates if you don't want to insert already existing records
      });
    }

    // Insert into your monthly summary table
    if (monthlySales.length > 0) {
      await prisma.monthlySummary.createMany({
        data: monthlySales.map(sale => ({
          month: sale.month,
          totalAmount: sale.totalamount // Ensure correct property names
        })),
        skipDuplicates: true // Optional: Skip duplicates if you don't want to insert already existing records
      });
    }

    // Insert into your yearly summary table
    if (yearlySales.length > 0) {
      await prisma.yearlySummary.createMany({
        data: yearlySales.map(sale => ({
          year: sale.year,
          totalAmount: sale.totalamount // Ensure correct property names
        })),
        skipDuplicates: true // Optional: Skip duplicates if you don't want to insert already existing records
      });
    }

    console.log('Sales summaries added successfully.');
  } catch (error) {
    console.error('Error adding sales summaries:', error);
  }
});
