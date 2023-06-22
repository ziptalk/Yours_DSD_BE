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
import { logger } from "./winston";

/**nft모듈: nft발행 */
const deployNFT = async (nftName: string) => {
  /**web2상에 nft 정보 존재하는지 확인 */
  const nftInfo = await nftService.getNftInfo(nftName);
  /**Deploy상태인지 확인 */
  await nftService.checkDeployedState(nftName);
  const metaUri = await uploadMetaIpfs(
    nftInfo.name,
    nftInfo.description!,
    nftInfo.image!,
    nftInfo.video!,
  );
  logger.info("ipfs에 정보 업로드 완료", metaUri);

  /**nft 발행 시작 */
  await nftService.startDeploy(nftName);
  const deployData = await deployMumbaiNFT(nftInfo.name, metaUri);
  logger.info("deploy NFT 완료");
  await nftService.finishDeploy(nftName);
  await nftService.saveNftAddress(nftName, deployData!.contractAddress);
  logger.info("nftAddress 저장 완료");
};

/**nft모듈: nft민팅 */
const mintNft = async (nftName: string, receiverAddress: string, userId: string) => {
  /**web2상에서 가지고있는지, isLoading이 false인지 체크하고 가지고있으면 민팅 시작.*/
  const userNft = await nftService.getUnmintedUserNftInfo(nftName, userId);
  if (!userNft) {
    throw errorGenerator({
      msg: responseMessage.INVALID_NFT,
      statusCode: statusCode.BAD_REQUEST,
    });
  }
  logger.info(`${JSON.stringify(userNft, null, 4)}를 민팅합니다.`);

  await nftService.startLoading(userNft.id);
  const nftInfo = await nftService.getNftInfo(nftName);
  const nftContract = new ethers.Contract(
    nftInfo.nftAddress as string,
    dsdBenefitData.abi,
    polygonProvider,
  );
  logger.info(`nftContract 구성 완료`);
  const mintData = await mintMumbaiNFT(nftContract, receiverAddress);
  logger.info(`mintData는 ${JSON.stringify(mintData, null, 4)}`);
  await nftService.saveMintId(
    userNft.id,
    mintData.mintId,
    mintData.transactionHash,
    mintData.date,
  );
  await nftService.finishLoading(userNft.id);
  return mintData;
};

/**nft모듈: nft소각 */
const burnNft = async (nftName: string, userId: string) => {
  let id;
  try {
    const nftInfo = await nftService.getNftInfo(nftName);
    /**민팅된 nft 조회 */
    const userNft = await nftService.getMintedUserNftInfo(nftName, userId);
    if (!userNft) {
      throw errorGenerator({
        msg: responseMessage.INSUFFICIENT_NFT,
        statusCode: statusCode.BAD_REQUEST,
      });
    }
    id = userNft.id;
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
  } catch (error) {
    logger.info(
      `${id}번 유저의 ${nftName} 소유정보(${id}) is_loading을 false로 되돌립니다.`,
    );
    await nftService.finishLoading(id as number);
    throw error;
  }
};
export { deployNFT, mintNft, burnNft };
