import { PrismaClient } from "@prisma/client";
import statusCode from "../module/constants/statusCode";
import errorGenerator from "../module/error/errorGenerator";
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
    throw errorGenerator({ statusCode: statusCode.INTERNAL_SERVER_ERROR });
  }
};

export { saveMintInfo };
