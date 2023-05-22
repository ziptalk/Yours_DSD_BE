import { PrismaClient } from "@prisma/client";
import statusCode from "../module/constants/statusCode";
import errorGenerator from "../module/error/errorGenerator";
import { responseMessage } from "../module";
import { nftDto } from "../interface/nftDto";
const prisma = new PrismaClient();

const saveMintInfo = async (userId: number, nftName: string) => {
  try {
    const user = await prisma.user_has_nft.create({
      data: {
        user_id: userId,
        name: nftName,
      },
    });
    const data = {
      userId: user.user_id,
      name: user.name,
    };
    return data;
  } catch (error) {
    throw errorGenerator({
      msg: responseMessage.SAVE_USER_NFT_FAIL,
      statusCode: statusCode.DB_ERROR,
    });
  }
};

const deleteManyMintInfo = async (userId: number, nfts: Array<string>) => {
  try {
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < nfts.length; i++) {
        const nftName = nfts[i];
        const nft = await tx.user_has_nft.findFirst({
          where: { user_id: userId, name: nftName },
        });
        await tx.user_has_nft.delete({
          where: {
            id: nft?.id,
          },
        });
      }
    });
  } catch (error) {
    throw errorGenerator({
      msg: responseMessage.INSUFFICIENT_NFT,
      statusCode: statusCode.BAD_REQUEST,
    });
  }
};

const getUserNftByUserId = async (userId: number) => {
  try {
    const data = await prisma.user_has_nft.findMany({
      where: { user_id: userId, deleted_at: null },
      select: { user_id: true, name: true },
    });
    return data;
  } catch (error) {
    throw errorGenerator({
      msg: responseMessage.GET_USER_NFT_INFO_FAIL,
      statusCode: statusCode.DB_ERROR,
    });
  }
};

const saveNftInfo = async (nftDto: nftDto) => {
  try {
    const createdNft = await prisma.nft.create({
      data: {
        name: nftDto.name,
        image: nftDto.image,
        video: nftDto.video,
        description: nftDto.description,
      },
    });
    return createdNft;
  } catch (error) {
    throw errorGenerator({
      msg: responseMessage.CREATE_NFT_INFO_FAIL,
      statusCode: statusCode.DB_ERROR,
    });
  }
};

const getNftInfo = async (nftName: string) => {
  try {
    const nftInfo = await prisma.nft.findFirst({ where: { name: nftName } });
    const data: nftDto = {
      name: nftInfo?.name!,
      image: nftInfo?.image,
      video: nftInfo?.video,
      description: nftInfo?.description,
    };
    return data;
  } catch (error) {
    throw errorGenerator({
      msg: responseMessage.GET_NFT_INFO_FAIL,
      statusCode: statusCode.DB_ERROR,
    });
  }
};
export { saveMintInfo, deleteManyMintInfo, getUserNftByUserId, saveNftInfo };
