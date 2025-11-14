"use server";

import { prisma } from "@/lib/prisma";

export async function getTotalTimeLast7Days() {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const stats = await prisma.file.aggregate({
      _sum: {
        durationMinutes: true,
      },
      where: {
        status: "READY",
        createdAt: { gte: sevenDaysAgo },
      },
    });

    const totalMinutes = stats._sum.durationMinutes || 0;
    const totalHours = (totalMinutes / 60).toFixed(1);
    return `${totalHours} Hours`;
  } catch (error) {
    console.error("Failed to get total time:", error);
    return "0 Hours";
  }
}
