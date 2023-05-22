import { uploadMetaIpfs } from "../contract/commonContract";
import { deployMumbaiNFT } from "../contract/mumbaiContract";
import {
  finishLoading,
  getNftInfo,
  saveNftAddress,
  startLoading,
} from "../service/nftService";
import responseMessage from "./constants/responseMessage";
import statusCode from "./constants/statusCode";
import errorGenerator from "./error/errorGenerator";

const deployNFT = async (nftName: string) => {
  try {
    const nftInfo = await getNftInfo(nftName);
    const metaUri = await uploadMetaIpfs(
      nftInfo.name,
      nftInfo.description!,
      nftInfo.image!,
      nftInfo.video!
    );

    /**nft 발행 시작 */
    await startLoading(nftName);
    const deployData = await deployMumbaiNFT(nftInfo.name, metaUri);
    await finishLoading(nftName);
    await saveNftAddress(nftName, deployData.contractAddress);
  } catch (error) {
    throw errorGenerator({
      msg: responseMessage.DEPLOY_NFT_FAIL,
      statusCode: statusCode.BAD_REQUEST,
    });
  }
};
