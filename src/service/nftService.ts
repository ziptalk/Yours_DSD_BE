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

/**userId기반 모든 유저 소유 nft정보 조회 */
const getAllUserNftByUserId = async (userId: number) => {
  try {
    const data = await prisma.user_has_nft.findMany({
      where: { user_id: userId, deleted_at: null, transaction_hash: null },
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
/**nft이름 기반 nft 정보 조회 */
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

const startDeploy = async (nftName: string) => {
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

const finishDeploy = async (nftName: string) => {
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

const startLoading = async (nftName: string, userId: number) => {
  try {
    const nft = await prisma.user_has_nft.findFirst({
      where: { name: nftName, user_id: userId },
    });
    await prisma.user_has_nft.update({
      where: {
        id: nft?.id,
      },
      data: {
        is_Loading: true,
      },
    });
  } catch (error) {
    throw errorGenerator({
      msg: responseMessage.START_LOADING_FAIL,
      statusCode: statusCode.DB_ERROR,
    });
  }
};

const finishLoading = async (nftName: string, userId: number) => {
  try {
    const nft = await prisma.user_has_nft.findFirst({
      where: { name: nftName, user_id: userId },
    });
    await prisma.user_has_nft.update({
      where: {
        id: nft?.id,
      },
      data: {
        is_Loading: false,
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

const saveMintId = async (id: number, mintId: number, txHash: string, txDate: Date) => {
  try {
    await prisma.user_has_nft.update({
      where: { id },
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

/**nft이름, userId기반 민팅되지 않은 nft정보 조회 */
const getUnmintedUserNftInfo = async (nftName: string, userId: number) => {
  try {
    const data = await prisma.user_has_nft.findFirst({
      where: {
        user_id: userId,
        name: nftName,
        deleted_at: null,
        transaction_hash: null,
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

/**nft이름, userId기반 민팅된 nft정보 조회 */
const getMintedUserNftInfo = async (nftName: string, userId: number) => {
  try {
    const data = await prisma.user_has_nft.findFirst({
      where: {
        user_id: userId,
        name: nftName,
        deleted_at: null,
        transaction_hash: { not: null },
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

const modifyNftInfo = async (nftDto: nftDto) => {
  try {
    const nft = await prisma.nft.findFirst({ where: { name: nftDto.name } });
    if (!nft) {
      throw Error;
    }
    const modifiedNft = await prisma.nft.update({
      where: { name: nftDto.name },
      data: {
        image: nftDto.image,
        video: nftDto.video,
        description: nftDto.description,
      },
    });
    return modifiedNft;
  } catch (error) {
    console.log(error);
    throw errorGenerator({
      msg: responseMessage.INVALID_NFT,
      statusCode: statusCode.NOT_FOUND,
    });
  }
};

const checkDeployedState = async (nftName: string) => {
  try {
    const data = await prisma.nft.findFirst({
      where: {
        name: nftName,
      },
    });
    if (data?.isLoading) {
      throw errorGenerator({
        msg: responseMessage.IS_LOADING_NFT,
        statusCode: statusCode.BAD_REQUEST,
      });
    }
  } catch (error) {
    throw error;
  }
};

const checkLoadingState = async (id: number) => {
  try {
    const data = await prisma.user_has_nft.findFirst({
      where: {
        id,
      },
    });
    if (data?.is_Loading) {
      throw errorGenerator({
        msg: responseMessage.IS_LOADING_NFT,
        statusCode: statusCode.BAD_REQUEST,
      });
    }
  } catch (error) {
    throw error;
  }
};
export {
  saveMintInfo,
  deleteManyMintInfo,
  getAllUserNftByUserId,
  saveNftInfo,
  getNftInfo,
  startDeploy,
  finishDeploy,
  saveNftAddress,
  saveMintId,
  getNftAddress,
  getUnmintedUserNftInfo,
  getMintedUserNftInfo,
  addBurnInfo,
  modifyNftInfo,
  checkDeployedState,
  checkLoadingState,
  startLoading,
  finishLoading,
};
