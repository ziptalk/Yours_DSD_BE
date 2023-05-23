import { Router } from "express";
import { body, param } from "express-validator";
import { nftController } from "../controller";
import errorValidator from "../module/error/errorValidator";
const router: Router = Router();

router.post(
  "/own",
  [body("userId").notEmpty(), body("nftName").notEmpty()],
  errorValidator,
  nftController.mintNft,
);

router.post(
  "/integrate",
  [body("userId").notEmpty(), body("oldNfts").notEmpty(), body("newNft").notEmpty()],
  errorValidator,
  nftController.integrateNft,
);

router.get(
  "/own/:userId",
  [param("userId").isInt()],
  errorValidator,
  nftController.getUserNftInfo,
);

router.delete(
  "/own/:userId",
  [param("userId").isInt(), body("nfts").notEmpty()],
  errorValidator,
  nftController.deleteUserNftInfo,
);

router.post("/", [body("name").notEmpty()], errorValidator, nftController.createNft);
export default router;
