import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const saveMintInfo = async (userId: number, nftGrade: string) => {
  try {
    const data = await prisma.user_has_nft.create({
      data: {
        user_id: userId,
        grade: nftGrade,
      },
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export { saveMintInfo };
