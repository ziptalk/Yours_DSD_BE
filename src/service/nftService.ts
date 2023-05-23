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

const getAllUserNftByUserId = async (userId: number) => {
  try {
    const data = await prisma.user_has_nft.findMany({
      where: { user_id: userId, deleted_at: null },
      select: {
        user_id: true,
        name: true,
        mint_id: true,
        transaction_date: true,
        transaction_hash: true,
      },
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
      nftAddress: nftInfo?.nftAddress,
    };
    return data;
  } catch (error) {
    throw errorGenerator({
      msg: responseMessage.GET_NFT_INFO_FAIL,
      statusCode: statusCode.DB_ERROR,
    });
  }
};

const startLoading = async (nftName: string) => {
  try {
    await prisma.nft.update({
      where: {
        name: nftName,
      },
      data: {
        isLoading: true,
      },
    });
  } catch (error) {
    throw errorGenerator({
      msg: responseMessage.START_LOADING_FAIL,
      statusCode: statusCode.DB_ERROR,
    });
  }
};

const finishLoading = async (nftName: string) => {
  try {
    await prisma.nft.update({
      where: {
        name: nftName,
      },
      data: {
        isLoading: false,
      },
    });
  } catch (error) {
    throw errorGenerator({
      msg: responseMessage.FINISH_LOADING_FAIL,
      statusCode: statusCode.DB_ERROR,
    });
  }
};

const saveNftAddress = async (nftName: string, nftAddress: string) => {
  try {
    await prisma.nft.update({
      where: { name: nftName },
      data: {
        nftAddress,
      },
    });
  } catch (error) {
    throw errorGenerator({
      msg: responseMessage.SAVE_NFT_ADDR_FAIL,
      statusCode: statusCode.DB_ERROR,
    });
  }
};

const saveMintId = async (
  nftName: string,
  userId: number,
  mintId: number,
  txHash: string,
  txDate: Date,
) => {
  try {
    await prisma.user_has_nft.updateMany({
      where: { user_id: userId, name: nftName },
      data: { mint_id: mintId, transaction_hash: txHash, transaction_date: txDate },
    });
  } catch (error) {
    throw errorGenerator({
      msg: responseMessage.SAVE_MINT_ID_FAIL,
      statusCode: statusCode.DB_ERROR,
    });
  }
};

const getNftAddress = async (nftName: string) => {
  const result = await prisma.nft.findFirst({
    where: { name: nftName },
    select: { nftAddress: true },
  });
  return result?.nftAddress;
};

/**nft이름, userId기반 nft정보 조회 */
const getUserNftInfo = async (nftName: string, userId: number) => {
  try {
    const data = await prisma.user_has_nft.findFirst({
      where: {
        user_id: userId,
        name: nftName,
        deleted_at: null,
      },
      select: {
        id: true,
        user_id: true,
        mint_id: true,
        transaction_hash: true,
        transaction_date: true,
      },
    });
    return data;
  } catch (error) {
    throw errorGenerator({
      msg: responseMessage.GET_NFT_INFO_FAIL,
      statusCode: statusCode.DB_ERROR,
    });
  }
};

/**소각 시 deletedAt정보 추가 */
const addBurnInfo = async (columnId: number) => {
  await prisma.user_has_nft.update({
    where: { id: columnId },
    data: { deleted_at: new Date() },
  });
};
export {
  saveMintInfo,
  deleteManyMintInfo,
  getAllUserNftByUserId,
  saveNftInfo,
  getNftInfo,
  startLoading,
  finishLoading,
  saveNftAddress,
  saveMintId,
  getNftAddress,
  getUserNftInfo,
  addBurnInfo,
};
