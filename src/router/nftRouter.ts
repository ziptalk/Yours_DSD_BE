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
  [param("userId").notEmpty()],
  errorValidator,
  nftController.getAllUserNftInfo,
);

router.put(
  "/own/:userId",
  [param("userId").notEmpty(), body("nfts").notEmpty()],
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
  "/burn/:userId/:nftName",
  [param("userId").notEmpty(), param("nftName").notEmpty()],
  errorValidator,
  nftController.deployAndBurnNft,
);

router.post("/", [body("name").notEmpty()], errorValidator, nftController.createNft);

/**WEB2 nft정보 수정 */
router.put(
  "/:nftName",
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
  "/publish/:nftName",
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
router.delete("/:nftName", nftController.deleteNftInfoByName);
export default router;
