-- CreateTable
CREATE TABLE "WeeklySummary" (
    "week" TIMESTAMP(3) NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "id" SERIAL NOT NULL,

    CONSTRAINT "WeeklySummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlySummary" (
    "month" TIMESTAMP(3) NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "id" SERIAL NOT NULL,

    CONSTRAINT "MonthlySummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YearlySummary" (
    "year" INTEGER NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "id" SERIAL NOT NULL,

    CONSTRAINT "YearlySummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WeeklySummary_week_key" ON "WeeklySummary"("week");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlySummary_month_key" ON "MonthlySummary"("month");

-- CreateIndex
CREATE UNIQUE INDEX "YearlySummary_year_key" ON "YearlySummary"("year");
