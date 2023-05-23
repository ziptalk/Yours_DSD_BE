import { Request, Response, NextFunction } from "express";
import responseMessage from "../module/constants/responseMessage";
import statusCode from "../module/constants/statusCode";
import { success } from "../module/util";
import { nftService } from "../service";
import { nftDto } from "../interface/nftDto";
import { deployNFT, mintNft } from "../module/nft";
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
    await nftService.deleteManyMintInfo(userId, oldNfts);
    const data = await nftService.saveMintInfo(userId, newNft);
    return success(res, statusCode.OK, responseMessage.SUCCESS, data);
  } catch (error) {
    next(error);
  }
};

const getUserNftInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const data = await nftService.getUserNftByUserId(+userId);
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

const transferNft = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, nftName, receiverAddress } = req.body;

    /**발행 여부 확인 */
    const nftAddress = await nftService.getNftAddress(nftName);
    if (!nftAddress) {
      console.log(`${nftName}의 발행이 시작되었습니다.`);
      await deployNFT(nftName);
      console.log(`${nftName}의 발행이 완료되었습니다.`);
    }

    /**nft 민팅 */
    console.log(`${nftName}의 민팅이 시작되었습니다.`);
    await mintNft(nftName, receiverAddress, userId);
    console.log(`${nftName}의 민팅이 완료되었습니다.`);
    return success(res, statusCode.OK, responseMessage.SUCCESS);
  } catch (error) {
    next(error);
  }
};

export {
  web2Mint,
  integrateNft,
  getUserNftInfo,
  deleteUserNftInfo,
  createNft,
  transferNft,
};
