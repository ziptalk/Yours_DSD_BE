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
import { sendApiEvent } from "../module/apiTracking";
const web2Mint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, nftName } = req.body;
    const nft = await nftService.getNftInfo(nftName);
    if (!nft)
      throw errorGenerator({
        msg: responseMessage.INVALID_NFT,
        statusCode: statusCode.NOT_FOUND,
      });
    const data = await nftService.saveMintInfo(userId, nftName);
    await sendApiEvent("WEB2_NFT_OWN_CREATE");
    return success(res, statusCode.OK, responseMessage.SUCCESS, data);
  } catch (error) {
    next(error);
  }
};

const integrateNft = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, oldNfts, newNft } = req.body;
    /**newNft가 존재하는지 검사 */
    await nftService.getNftInfo(newNft);
    const data = await nftService.integrateNft(userId, oldNfts, newNft);
    await sendApiEvent("WEB2_NFT_INTEGRATE");
    return success(res, statusCode.OK, responseMessage.SUCCESS, data);
  } catch (error) {
    next(error);
  }
};

const getAllUserNftInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const userNfts = await nftService.getAllUserNftByUserId(userId);
    let data: any[] = [];
    for (let i = 0; i < userNfts.length; i++) {
      const { name, user_id } = userNfts[i];
      const userNft = {
        userId: user_id,
        name,
      };
      data.push(userNft);
    }

    await sendApiEvent("WEB2_NFT_OWN_GET");
    return success(res, statusCode.OK, responseMessage.SUCCESS, data);
  } catch (error) {
    next(error);
  }
};

const deleteUserNftInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { nfts } = req.body;
    await nftService.deleteManyMintInfo(userId, nfts);
    await sendApiEvent("WEB2_NFT_OWN_DELETE");
    return success(res, statusCode.OK, responseMessage.SUCCESS);
  } catch (error) {
    next(error);
  }
};

const createNft = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, image, video, description } = req.body;
    const isNftNameExist = await nftService.isNftNameExist(name);
    if (isNftNameExist)
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
    await sendApiEvent("WEB2_NFT_CREATE");
    return success(res, statusCode.OK, responseMessage.SUCCESS, data);
  } catch (error) {
    logger.error(error);
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
    await sendApiEvent("WEB3_NFT_TRANSFER");
    return success(res, statusCode.OK, responseMessage.SUCCESS, mintData);
  } catch (error) {
    logger.info(error);
    const userNft = await nftService.getLoadingUserNftInfo(name, id);
    logger.info(
      `다음 nft의 is_loading을 false로 되돌립니다.${JSON.stringify(userNft, null, 4)}`,
    );
    await nftService.finishLoading(userNft?.id!);
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
    const transactionHash = await burnNft(nftName, userId);
    logger.info(`${nftName}의 소각이 완료되었습니다.`);
    await sendApiEvent("WEB3_NFT_BURN");
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
    /**바꾸려는 nft 이름이 이미 존재하는지 확인 */
    const isNftNameExist = await nftService.isNftNameExist(name);
    if (isNftNameExist)
      throw errorGenerator({
        msg: responseMessage.NFT_ALREADY_EXIST,
        statusCode: statusCode.BAD_REQUEST,
      });
    /**nft 존재 여부 확인 */
    const nftInfo = await nftService.getNftInfo(nftName);
    logger.info(`nft 존재 여부 확인 결과 nftInfo ${JSON.stringify(nftInfo, null, 4)}`);
    await nftService.modifyNftInfo(nftName, nftDto);
    await sendApiEvent("WEB2_NFT_EDIT");
    return success(res, statusCode.OK, responseMessage.SUCCESS);
  } catch (error) {
    next(error);
  }
};

const modifyDeployedNftData = async (req: Request, res: Response, next: NextFunction) => {
  let globalName;
  try {
    const { nftName } = req.params;
    const { name, image, video, description } = req.body;
    const nftDto: nftDto = {
      name,
      image,
      video,
      description,
    };
    globalName = name;
    /**바꾸려는 nft 이름이 이미 존재하는지 확인 */
    const isNftNameExist = await nftService.isNftNameExist(name);
    if (isNftNameExist)
      throw errorGenerator({
        msg: responseMessage.NFT_ALREADY_EXIST,
        statusCode: statusCode.BAD_REQUEST,
      });
    /**nft 존재 여부 확인 */
    const nftInfo = await nftService.getNftInfo(nftName);
    logger.info(`nft 존재 여부 확인 결과 nftInfo ${JSON.stringify(nftInfo, null, 4)}`);
    /**발행 여부 확인 */
    if (!nftInfo.nftAddress)
      throw errorGenerator({
        msg: responseMessage.UNPUBLISHED_NFT,
        statusCode: statusCode.BAD_REQUEST,
      });
    /**로딩 여부 확인 */
    if (nftInfo.isLoading)
      throw errorGenerator({
        msg: responseMessage.IS_LOADING_NFT,
        statusCode: statusCode.BAD_REQUEST,
      });
    await nftService.startDeploy(nftName);
    await nftService.modifyNftInfo(nftName, nftDto);
    const newUri = await uploadMetaIpfs(name, description, image, video);
    const data = await setUri(newUri, nftInfo.nftAddress);
    await nftService.finishDeploy(name);
    await sendApiEvent("WEB3_NFT_EDIT");
    return success(res, statusCode.OK, responseMessage.SUCCESS, data);
  } catch (error) {
    logger.error("[nftService]modifyDeployedNftData ERROR");
    logger.error(error);
    next(error);
  }
};

const getNftInfoByName = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nftName } = req.params;
    const data = await nftService.getNftInfo(nftName);
    await sendApiEvent("WEB2_NFT_GET");
    return success(res, statusCode.OK, responseMessage.SUCCESS, data);
  } catch (error) {
    next(error);
  }
};

const deleteNftInfoByName = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nftName } = req.params;
    const data = await nftService.deleteNftInfo(nftName);
    await sendApiEvent("WEB2_NFT_DELETE");
    return success(res, statusCode.OK, responseMessage.SUCCESS);
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
