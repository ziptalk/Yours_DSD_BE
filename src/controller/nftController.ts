import { Request, Response, NextFunction } from "express";
import responseMessage from "../module/constants/responseMessage";
import statusCode from "../module/constants/statusCode";
import { success } from "../module/util";
import { nftService } from "../service";
import { nftDto } from "../interface/nftDto";
const mintNft = async (req: Request, res: Response, next: NextFunction) => {
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

export { mintNft, integrateNft, getUserNftInfo, deleteUserNftInfo, createNft };
