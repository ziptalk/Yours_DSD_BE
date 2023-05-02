import { Router } from "express";
import nftRouter from "./nftRouter";

const router: Router = Router();
router.use("/nft", nftRouter);

export default router;
