import { Request, Response, NextFunction } from "express";
import { nftService } from "../service";
const mintNft = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, nftGrade } = req.body;
  await nftService.saveMintInfo(+userId, nftGrade);
  res.send("success");
};

export { mintNft };
