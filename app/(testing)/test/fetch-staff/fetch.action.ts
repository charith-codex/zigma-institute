"use server";

import { prisma } from "@/db/prisma";

export const fetchStaffContact = async (userId: string) => {
  const staff = await prisma.user.findFirst({
    where: { id: userId }, // or use specific userId
    select: {
      name: true,
      phone: true,
      // fetch from sub tables
      staff: {
        select: { nic: true },
      },
    },
  });

  return staff;
};
