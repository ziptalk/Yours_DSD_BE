import { Request, Response, NextFunction } from "express";
import responseMessage from "../module/constants/responseMessage";
import statusCode from "../module/constants/statusCode";
import { success } from "../module/util";
import { nftService } from "../service";
const mintNft = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, nftGrade } = req.body;
  const data = await nftService.saveMintInfo(+userId, nftGrade);
  success(res, statusCode.OK, responseMessage.SAVE_USER_NFT_INFO_SUCCESS, data);
};

export { mintNft };
