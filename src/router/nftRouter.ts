import { Router } from "express";
import { nftController } from "../controller";
const router: Router = Router();

router.post("/", nftController.mintNft);
export default router;
