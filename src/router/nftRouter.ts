import { Router } from "express";
import { body } from "express-validator";
import { nftController } from "../controller";
import errorValidator from "../module/error/errorValidator";
import { error } from "console";
const router: Router = Router();
console.log("라우터");
router.post(
  "/own",
  [body("userId").notEmpty(), body("nftName").notEmpty()],
  errorValidator,
  nftController.mintNft
);
router.post(
  "/integrate",
  [
    body("userId").notEmpty(),
    body("oldNfts").notEmpty(),
    body("newNft").notEmpty(),
  ],
  errorValidator,
  nftController.integrateNft
);

export default router;
