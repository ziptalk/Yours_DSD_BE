import { ethers } from "ethers";
import { uploadMetaIpfs } from "../contract/commonContract";
import {
  deployMumbaiNFT,
  mintMumbaiNFT,
  polygonProvider,
} from "../contract/mumbaiContract";
import {
  finishLoading,
  getNftInfo,
  saveMintId,
  saveNftAddress,
  startLoading,
} from "../service/nftService";
import dsdBenefitData from "../contract/DSDBenefitNFT.json";
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
      nftInfo.video!,
    );
    console.log("ipfs에 정보 업로드 완료", JSON.stringify(metaUri, null, 4));

    /**nft 발행 시작 */
    await startLoading(nftName);
    const deployData = await deployMumbaiNFT(nftInfo.name, metaUri);
    console.log("deploy NFT 완료");
    await finishLoading(nftName);
    await saveNftAddress(nftName, deployData!.contractAddress);
    console.log("nftAddress 저장 완료");
  } catch (error) {
    throw errorGenerator({
      msg: responseMessage.DEPLOY_NFT_FAIL,
      statusCode: statusCode.BAD_REQUEST,
    });
  }
};

const mintNft = async (nftName: string, receiverAddress: string, userId: number) => {
  try {
    const nftInfo = await getNftInfo(nftName);

    const nftContract = new ethers.Contract(
      nftInfo.nftAddress as string,
      dsdBenefitData.abi,
      polygonProvider,
    );
    const mintData = await mintMumbaiNFT(nftContract, receiverAddress);
    await saveMintId(nftName, userId, mintData.mintId);
  } catch (error) {
    throw errorGenerator({
      msg: responseMessage.MINT_NFT_FAIL,
      statusCode: statusCode.BAD_REQUEST,
    });
  }
};
export { deployNFT, mintNft };
