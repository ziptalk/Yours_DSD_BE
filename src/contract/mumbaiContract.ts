import config from "../config";
import { errorGenerator, responseMessage, statusCode } from "../module";
import { getDeployedAddress } from "./commonContract";
import deployed from "./deployed-address.json";
import factoryData from "./DSDFactory.json";
import benefitData from "./DSDBenefitNFT.json";
import { ethers } from "ethers";
import { logger } from "../module/winston";

const factoryAddress = deployed.DSDFactory;
const polygonProvider = new ethers.providers.JsonRpcProvider(config.polygonRPC);
const walletObj = new ethers.Wallet(config.walletSecretKey);
const wallet = walletObj.connect(polygonProvider);
const walletAddress = config.walletAddress;
const contract = new ethers.Contract(factoryAddress, factoryData.abi, polygonProvider);

const deployMumbaiNFT = async (name: string | null, uri: string | null) => {
  try {
    polygonProvider.getTransactionCount(walletAddress).then((nonce) => {
      logger.info("Nonce in burnNft is ", nonce);
    });

    let rc;
    const gasFeeData = await polygonProvider.getFeeData();
    const tx = await contract.connect(wallet).deployNFT(name, "", uri, {
      gasPrice: gasFeeData.gasPrice,
    });
    rc = await tx.wait();
    const addr = await getDeployedAddress(rc);
    return addr;
  } catch (error) {
    logger.error("deployMumbaiNFT에서 에러 발생");
    logger.error(error);
    throw errorGenerator({
      msg: responseMessage.DEPLOY_NFT_FAIL_WEB3,
      statusCode: statusCode.WEB3_ERROR,
    });
  }
};

const mintMumbaiNFT = async (nft: any, address: string) => {
  try {
    polygonProvider.getTransactionCount(walletAddress).then((nonce) => {
      logger.info("Nonce in burnNft is ", nonce);
    });
    const gasFeeData = await polygonProvider.getFeeData();
    const transaction = await nft.connect(wallet).mint(address, {
      gasPrice: gasFeeData.gasPrice,
      gasLimit: 3000000,
    });
    const rc = await transaction.wait();
    const event = rc.events.find((event: any) => event.event === "Mint");
    const mintId = event.args[0].toNumber();
    const transactionHash = event.transactionHash;
    const block = await event.getBlock(); // check minting block timestamp
    const date = new Date(block.timestamp * 1000);

    const data = {
      mintId: mintId,
      transactionHash: transactionHash,
      date: date,
    };

    return data;
  } catch (error) {
    logger.error("mintMumbaiNFT에서 에러 발생");
    logger.error(error);
    throw errorGenerator({
      msg: responseMessage.MINT_NFT_FAIL_WEB3,
      statusCode: statusCode.WEB3_ERROR,
    });
  }
};

const transferMumbaiNFT = async (
  nft: ethers.Contract,
  id: number,
  from: string,
  to: string,
) => {
  const transaction = await nft.connect(wallet).transferFrom(from, to, id);
  const rc = await transaction.wait();
  const data = {
    transactionHash: rc.transactionHash,
  };

  return data;
};
const burnNFT = async (nft: any, mintId: number) => {
  try {
    polygonProvider.getTransactionCount(walletAddress).then((nonce) => {
      logger.info("Nonce in burnNft is ", nonce);
    });
    const gasFeeData = await polygonProvider.getFeeData();
    const tx = await nft.connect(wallet).burn(mintId, {
      gasPrice: gasFeeData.gasPrice,
      gasLimit: 3000000,
    });
    const rc = await tx.wait();
    return rc;
  } catch (error) {
    logger.error("burnNFT에서 에러 발생");
    logger.error(error);
    throw errorGenerator({
      msg: responseMessage.BURN_NFT_FAIL_WEB3,
      statusCode: statusCode.WEB3_ERROR,
    });
  }
};

const setUri = async (uri: string, nftAddress: string) => {
  try {
    polygonProvider.getTransactionCount(walletAddress).then((nonce) => {
      logger.info("Nonce in setUri is ", nonce);
    });
    const contract = new ethers.Contract(nftAddress, benefitData.abi, polygonProvider);
    let rc;
    const gas = await contract.connect(wallet).estimateGas.setURI(uri);
    const tx = await contract.connect(wallet).setURI(uri, {
      gasLimit: gas,
    });
    rc = await tx.wait();
    const data = {
      transactionHash: rc.transactionHash,
    };
    return data;
  } catch (error) {
    logger.error("setUri에서 에러 발생");
    logger.error(error);
    throw errorGenerator({
      msg: responseMessage.SET_NFT_URI_FAIL_WEB3,
      statusCode: statusCode.WEB3_ERROR,
    });
  }
};

export {
  deployMumbaiNFT,
  polygonProvider,
  mintMumbaiNFT,
  transferMumbaiNFT,
  burnNFT,
  setUri,
};
