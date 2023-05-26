import { ethers } from "ethers";
import { uploadMetaIpfs } from "../contract/commonContract";
import {
  burnNFT,
  deployMumbaiNFT,
  mintMumbaiNFT,
  polygonProvider,
} from "../contract/mumbaiContract";
import dsdBenefitData from "../contract/DSDBenefitNFT.json";
import responseMessage from "./constants/responseMessage";
import statusCode from "./constants/statusCode";
import errorGenerator from "./error/errorGenerator";
import { nftService } from "../service";

/**nft모듈: nft발행 */
const deployNFT = async (nftName: string) => {
  try {
    await nftService.checkDeployedState(nftName);
    const nftInfo = await nftService.getNftInfo(nftName);
    const metaUri = await uploadMetaIpfs(
      nftInfo.name,
      nftInfo.description!,
      nftInfo.image!,
      nftInfo.video!,
    );
    console.log("ipfs에 정보 업로드 완료", JSON.stringify(metaUri, null, 4));

    /**nft 발행 시작 */
    await nftService.startDeploy(nftName);
    const deployData = await deployMumbaiNFT(nftInfo.name, metaUri);
    console.log("deploy NFT 완료");
    await nftService.finishDeploy(nftName);
    await nftService.saveNftAddress(nftName, deployData!.contractAddress);
    console.log("nftAddress 저장 완료");
  } catch (error) {
    console.log(error);
    throw errorGenerator({
      msg: responseMessage.DEPLOY_NFT_FAIL_WEB2,
      statusCode: statusCode.BAD_REQUEST,
    });
  }
};

/**nft모듈: nft민팅 */
const mintNft = async (nftName: string, receiverAddress: string, userId: number) => {
  /**web2상에서 가지고있는지 체크하고 가지고있으면 민팅 시작.*/
  const userNft = await nftService.getUnmintedUserNftInfo(nftName, userId);
  if (!userNft) {
    throw errorGenerator({
      msg: responseMessage.INSUFFICIENT_NFT,
      statusCode: statusCode.BAD_REQUEST,
    });
  }
  /**로딩여부 체크 */
  await nftService.checkLoadingState(userNft.id);

  await nftService.startLoading(userNft.id);
  const nftInfo = await nftService.getNftInfo(nftName);
  const nftContract = new ethers.Contract(
    nftInfo.nftAddress as string,
    dsdBenefitData.abi,
    polygonProvider,
  );
  const mintData = await mintMumbaiNFT(nftContract, receiverAddress);
  console.log(mintData);
  await nftService.saveMintId(
    userNft.id,
    mintData.mintId,
    mintData.transactionHash,
    mintData.date,
  );
  await nftService.finishLoading(userNft.id);
};

/**nft모듈: nft소각 */
const burnNft = async (nftName: string, userId: number) => {
  const nftInfo = await nftService.getNftInfo(nftName);
  /**민팅된 nft 조회 */
  const userNft = await nftService.getMintedUserNftInfo(nftName, userId);
  if (!userNft) {
    throw errorGenerator({
      msg: responseMessage.INSUFFICIENT_NFT,
      statusCode: statusCode.BAD_REQUEST,
    });
  }
  /**로딩여부 체크 */
  await nftService.checkLoadingState(userNft.id);
  const nftContract = new ethers.Contract(
    nftInfo.nftAddress as string,
    dsdBenefitData.abi,
    polygonProvider,
  );

  await nftService.startLoading(userNft.id);
  const burnInfo = await burnNFT(nftContract, userNft?.mint_id!);
  await nftService.addBurnInfo(userNft?.id!);
  await nftService.finishLoading(userNft.id);

  return burnInfo.transactionHash;
};
export { deployNFT, mintNft, burnNft };
