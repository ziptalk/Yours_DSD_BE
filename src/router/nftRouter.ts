import { Router } from "express";
import { body } from "express-validator";
import { nftController } from "../controller";
import errorValidator from "../module/error/errorValidator";
const router: Router = Router();

router.post(
  "/",
  [body("userId").notEmpty(), body("nftGrade").notEmpty()],
  errorValidator,
  nftController.mintNft
);
export default router;
