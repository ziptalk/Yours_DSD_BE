import { Request, Response, NextFunction } from "express";
import responseMessage from "../module/constants/responseMessage";
import statusCode from "../module/constants/statusCode";
import { fail, success } from "../module/util";
import { nftService } from "../service";
import { nftDto } from "../interface/nftDto";
import { burnNft, deployNFT, mintNft } from "../module/nft";
import { uploadMetaIpfs } from "../contract/commonContract";
import { setUri } from "../contract/mumbaiContract";
import { logger } from "../module/winston";
import { errorGenerator } from "../module";
const web2Mint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, nftName } = req.body;
    const data = await nftService.saveMintInfo(+userId, nftName);
    return success(res, statusCode.OK, responseMessage.SUCCESS, data);
  } catch (error) {
    next(error);
  }
};

const integrateNft = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, oldNfts, newNft } = req.body;
    const data = await nftService.integrateNft(userId, oldNfts, newNft);
    return success(res, statusCode.OK, responseMessage.SUCCESS, data);
  } catch (error) {
    next(error);
  }
};

const getAllUserNftInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const data = await nftService.getAllUserNftByUserId(+userId);
    logger.info("nft소유정보를 조회합니다.");
    return success(res, statusCode.OK, responseMessage.SUCCESS, data);
  } catch (error) {
    next(error);
  }
};

const deleteUserNftInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { nfts } = req.body;
    await nftService.deleteManyMintInfo(+userId, nfts);
    return success(res, statusCode.OK, responseMessage.SUCCESS);
  } catch (error) {
    next(error);
  }
};

const createNft = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, image, video, description } = req.body;
    const nft = nftService.getNftInfo(name);
    if (!!nft)
      throw errorGenerator({
        msg: responseMessage.NFT_ALREADY_EXIST,
        statusCode: statusCode.BAD_REQUEST,
      });
    const nftDto: nftDto = {
      name,
      image,
      video,
      description,
    };
    const data = await nftService.saveNftInfo(nftDto);
    return success(res, statusCode.OK, responseMessage.SUCCESS, data);
  } catch (error) {
    next(error);
  }
};

const deployAndTransferNft = async (req: Request, res: Response, next: NextFunction) => {
  let id, name;
  try {
    const { userId, nftName, receiverAddress } = req.body;
    id = userId;
    name = nftName;
    /**발행 여부 확인 */
    const nftAddress = await nftService.getNftAddress(nftName);
    if (!nftAddress) {
      logger.info(`${nftName}의 발행이 시작되었습니다.`);
      await deployNFT(nftName);
      logger.info(`${nftName}의 발행이 완료되었습니다.`);
    }

    /**nft 민팅 */
    logger.info(`${nftName}의 민팅이 시작되었습니다.`);
    const mintData = await mintNft(nftName, receiverAddress, userId);
    logger.info(`${nftName}의 민팅이 완료되었습니다.`);
    return success(res, statusCode.OK, responseMessage.SUCCESS, mintData);
  } catch (error) {
    logger.info(error);
    const userNft = await nftService.getLoadingUserNftInfo(name, +id);
    logger.info(
      `다음 nft의 is_Loading을 false로 되돌립니다.${JSON.stringify(userNft, null, 4)}`,
    );
    nftService.finishLoading(userNft?.id!);
    next(error);
  }
};

const deployAndBurnNft = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, nftName } = req.params;

    /**발행 여부 확인 */
    const nftAddress = await nftService.getNftAddress(nftName);
    if (!nftAddress) {
      logger.info(`${nftName}의 발행이 시작되었습니다.`);
      await deployNFT(nftName);
      logger.info(`${nftName}의 발행이 완료되었습니다.`);
    }

    /**nft 소각 */
    logger.info(`${nftName}의 소각이 시작되었습니다.`);
    const transactionHash = await burnNft(nftName, +userId);
    logger.info(`${nftName}의 소각이 완료되었습니다.`);
    return success(res, statusCode.OK, responseMessage.SUCCESS, {
      transactionHash: transactionHash,
    });
  } catch (error) {
    next(error);
  }
};

const modifyNft = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nftName } = req.params;
    const { name, image, video, description } = req.body;
    const nftDto: nftDto = {
      name,
      image,
      video,
      description,
    };
    const data = await nftService.modifyNftInfo(nftName, nftDto);
    return success(res, statusCode.OK, responseMessage.SUCCESS, data);
  } catch (error) {
    next(error);
  }
};

const modifyDeployedNftData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nftName } = req.params;
    const { name, image, video, description } = req.body;
    const nftDto: nftDto = {
      name,
      image,
      video,
      description,
    };
    await nftService.startDeploy(nftName);
    await nftService.modifyNftInfo(nftName, nftDto);
    const nftAddress = await nftService.getNftAddress(name);
    if (!nftAddress) {
      return fail(res, statusCode.NOT_FOUND, responseMessage.UNPUBLISHED_NFT);
    }
    const newUri = await uploadMetaIpfs(name, description, image, video);
    const data = await setUri(newUri, nftAddress);
    await nftService.finishDeploy(name);
    return success(res, statusCode.OK, responseMessage.SUCCESS, data);
  } catch (error) {
    next(error);
  }
};

const getNftInfoByName = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nftName } = req.params;
    const data = await nftService.getNftInfo(nftName);
    return success(res, statusCode.OK, responseMessage.SUCCESS, data);
  } catch (error) {
    next(error);
  }
};

const deleteNftInfoByName = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nftName } = req.params;
    const data = await nftService.deleteNftInfo(nftName);

    return success(res, statusCode.OK, responseMessage.SUCCESS, data);
  } catch (error) {
    next(error);
  }
};

export {
  web2Mint,
  integrateNft,
  getAllUserNftInfo,
  deleteUserNftInfo,
  createNft,
  deployAndTransferNft,
  deployAndBurnNft,
  modifyNft,
  modifyDeployedNftData,
  getNftInfoByName,
  deleteNftInfoByName,
};
