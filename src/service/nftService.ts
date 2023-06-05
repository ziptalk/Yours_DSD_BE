import { PrismaClient } from "@prisma/client";
import statusCode from "../module/constants/statusCode";
import errorGenerator from "../module/error/errorGenerator";
import { responseMessage } from "../module";
import { nftDto } from "../interface/nftDto";
import { logger } from "../module/winston";
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
    logger.error("[nftService]saveNftInfo ERROR");
    logger.error(error);
    throw errorGenerator({
      msg: responseMessage.SAVE_USER_NFT_FAIL,
      statusCode: statusCode.DB_ERROR,
    });
  }
};

/**유저 소유 nft 여러개 삭제 */
const deleteManyMintInfo = async (userId: number, nfts: Array<string>) => {
  try {
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < nfts.length; i++) {
        const nftName = nfts[i];
        const nft = await tx.user_has_nft.findFirst({
          where: { user_id: userId, name: nftName, transaction_hash: null },
        });
        await tx.user_has_nft.delete({
          where: {
            id: nft?.id,
          },
        });
      }
    });
  } catch (error) {
    logger.error("[nftService]deleteManyMintInfo ERROR");
    logger.error(error);
    throw errorGenerator({
      msg: responseMessage.INSUFFICIENT_NFT,
      statusCode: statusCode.BAD_REQUEST,
    });
  }
};
/**통합 nft 생성 */
const integrateNft = async (userId: number, nfts: Array<string>, nftName: string) => {
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

      const userNft = await tx.user_has_nft.create({
        data: {
          user_id: userId,
          name: nftName,
        },
      });
      const data = {
        userId: userNft.user_id,
        name: userNft.name,
      };
      return data;
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
    const userNft = await prisma.user_has_nft.findMany({
      where: { user_id: userId, deleted_at: null, transaction_hash: null },
      select: {
        user_id: true,
        name: true,
        mint_id: true,
        transaction_date: true,
        transaction_hash: true,
      },
    });
    return userNft;
  } catch (error) {
    logger.error("[nftService]getAllUserNftByUserId ERROR");
    logger.error(error);
    throw errorGenerator({
      msg: responseMessage.GET_USER_NFT_INFO_FAIL,
      statusCode: statusCode.DB_ERROR,
    });
  }
};

const saveNftInfo = async (nftDto: nftDto) => {
  try {
    const createdNft = await prisma.nft.create({
      data: nftDto,
    });
    const data = {
      name: createdNft?.name!,
      image: createdNft?.image,
      video: createdNft?.video,
      description: createdNft?.description,
      nftAddress: createdNft?.nft_address,
      isLoading: createdNft.is_loading,
    };
    return data;
  } catch (error) {
    logger.error("[nftService]saveNftInfo ERROR");
    logger.error(error);
    throw errorGenerator({
      msg: responseMessage.CREATE_NFT_INFO_FAIL,
      statusCode: statusCode.DB_ERROR,
    });
  }
};
/**nft이름 기반 nft 정보 조회 */
const getNftInfo = async (nftName: string) => {
  const nftInfo = await prisma.nft.findFirst({ where: { name: nftName } });
  if (!nftInfo) {
    throw errorGenerator({
      msg: responseMessage.INVALID_NFT,
      statusCode: statusCode.NOT_FOUND,
    });
  }
  const data = {
    name: nftInfo?.name!,
    image: nftInfo?.image,
    video: nftInfo?.video,
    description: nftInfo?.description,
    nftAddress: nftInfo?.nft_address,
    isLoading: nftInfo.is_loading,
  };
  return data;
};

/**nft 이름 존재여부 조회 */
const isNftNameExist = async (nftName: string) => {
  const nft = await prisma.nft.findFirst({ where: { name: nftName } });
  return !!nft;
};

/**nft이름기반 nft데이터 삭제 */
const deleteNftInfo = async (nftName: string) => {
  try {
    const data = await prisma.nft.delete({ where: { name: nftName } });
    return data;
  } catch (error) {
    logger.error("[nftService]deleteNftInfo ERROR");
    logger.error(error);
    throw errorGenerator({
      msg: responseMessage.INVALID_NFT,
      statusCode: statusCode.NOT_FOUND,
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
        is_loading: true,
      },
    });
  } catch (error) {
    logger.error("[nftService]startDeploy ERROR");
    logger.error(error);
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
        is_loading: false,
      },
    });
  } catch (error) {
    logger.error("[nftService]finishDeploy ERROR");
    logger.error(error);
    throw errorGenerator({
      msg: responseMessage.FINISH_LOADING_FAIL,
      statusCode: statusCode.DB_ERROR,
    });
  }
};

const startLoading = async (id: number) => {
  try {
    const nft = await prisma.user_has_nft.findFirst({
      where: { id },
    });
    await prisma.user_has_nft.update({
      where: {
        id: nft?.id,
      },
      data: {
        is_loading: true,
      },
    });
  } catch (error) {
    logger.error("[nftService]startLoading ERROR");
    logger.error(error);
    throw errorGenerator({
      msg: responseMessage.START_LOADING_FAIL,
      statusCode: statusCode.DB_ERROR,
    });
  }
};

const finishLoading = async (id: number) => {
  try {
    const nft = await prisma.user_has_nft.findFirst({
      where: { id },
    });
    await prisma.user_has_nft.update({
      where: {
        id: nft?.id,
      },
      data: {
        is_loading: false,
      },
    });
  } catch (error) {
    logger.error("[nftService]finishLoading ERROR");
    logger.error(error);
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
        nft_address: nftAddress,
      },
    });
  } catch (error) {
    logger.error("[nftService]saveNftAddress ERROR");
    logger.error(error);
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
    logger.error("[nftService]saveMintId ERROR");
    logger.error(error);
    throw errorGenerator({
      msg: responseMessage.SAVE_MINT_ID_FAIL,
      statusCode: statusCode.DB_ERROR,
    });
  }
};

const getNftAddress = async (nftName: string) => {
  const result = await prisma.nft.findFirst({
    where: { name: nftName },
    select: { nft_address: true },
  });
  return result?.nft_address;
};

/**nft이름, userId기반 민팅되지 않은 nft정보 조회 + isLoading=false */
const getUnmintedUserNftInfo = async (nftName: string, userId: number) => {
  try {
    const data = await prisma.user_has_nft.findFirst({
      where: {
        user_id: userId,
        name: nftName,
        deleted_at: null,
        transaction_hash: null,
        is_loading: false,
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
    logger.error("[nftService]getUnmintedUserNftInfo ERROR");
    logger.error(error);
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
        is_loading: false,
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
    logger.error("[nftService]getMintedUserNftInfo ERROR");
    logger.error(error);
    throw errorGenerator({
      msg: responseMessage.GET_NFT_INFO_FAIL,
      statusCode: statusCode.DB_ERROR,
    });
  }
};

const getLoadingUserNftInfo = async (nftName: string, userId: number) => {
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
    logger.error("[nftService]getLoadingUserNftInfo ERROR");
    logger.error(error);
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

const modifyNftInfo = async (nftName: string, nftDto: nftDto) => {
  try {
    const modifiedNft = await prisma.nft.update({
      where: { name: nftName },
      data: nftDto,
    });
    return modifiedNft;
  } catch (error) {
    logger.error("[nftService]modifyNftInfo ERROR");
    logger.error(error);
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
    if (data?.is_loading) {
      throw errorGenerator({
        msg: responseMessage.IS_LOADING_NFT,
        statusCode: statusCode.BAD_REQUEST,
      });
    }
  } catch (error) {
    logger.error("[nftService]checkDeployedState ERROR");
    logger.error(error);
    throw error;
  }
};

const checkLoadingState = async (id: number) => {
  const data = await prisma.user_has_nft.findFirst({
    where: {
      id,
    },
  });
  if (data?.is_loading) {
    throw errorGenerator({
      msg: responseMessage.IS_LOADING_NFT,
      statusCode: statusCode.BAD_REQUEST,
    });
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
  deleteNftInfo,
  integrateNft,
  getLoadingUserNftInfo,
  isNftNameExist,
};
