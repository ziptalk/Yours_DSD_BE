import { Router } from "express";
import { body, param } from "express-validator";
import { nftController } from "../controller";
import errorValidator from "../module/error/errorValidator";
const router: Router = Router();

router.post(
  "/own",
  [body("userId").notEmpty(), body("nftName").notEmpty()],
  errorValidator,
  nftController.web2Mint,
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
  nftController.getAllUserNftInfo,
);

router.delete(
  "/own/:userId",
  [param("userId").isInt(), body("nfts").notEmpty()],
  errorValidator,
  nftController.deleteUserNftInfo,
);

router.post(
  "/transfer",
  [
    body("userId").notEmpty(),
    body("nftName").notEmpty(),
    body("receiverAddress").notEmpty(),
  ],
  errorValidator,
  nftController.deployAndTransferNft,
);

router.delete(
  "/burn",
  [body("userId").notEmpty(), body("nftName").notEmpty()],
  errorValidator,
  nftController.deployAndBurnNft,
);

router.post("/", [body("name").notEmpty()], errorValidator, nftController.createNft);

/**WEB2 nft정보 수정 */
router.put(
  "/",
  [
    body("name").notEmpty(),
    body("image").notEmpty(),
    body("video").notEmpty(),
    body("description").notEmpty(),
  ],
  errorValidator,
  nftController.modifyNft,
);
/**WEB3 nft 정보 수정 */
router.put(
  "/publish",
  [
    body("name").notEmpty(),
    body("image").notEmpty(),
    body("video").notEmpty(),
    body("description").notEmpty(),
  ],
  errorValidator,
  nftController.modifyDeployedNftData,
);

/**WEB2 nft 정보 조회 */
router.get("/:nftName", nftController.getNftInfoByName);

/**WEB2 nft 정보 삭제 */
export default router;
