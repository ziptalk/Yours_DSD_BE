import config from "../config";
import { getDeployedAddress } from "./commonContract";
import deployed from "./deployed-address.json";
import factoryData from "./DSDFactory.json";
import { ethers } from "ethers";

const factoryAddress = deployed.DSDFactory;
const polygonProvider = new ethers.providers.JsonRpcProvider(config.mumbaiRPC);
const walletObj = new ethers.Wallet(config.walletSecretKey);
const wallet = walletObj.connect(polygonProvider);
const contract = new ethers.Contract(
  factoryAddress,
  factoryData.abi,
  polygonProvider
);

const deployMumbaiNFT = async (
  name: string | null,
  uri: string | null,
  benefitUri: string | null
) => {
  try {
    let transaction;
    const gas = await contract
      .connect(wallet)
      .estimateGas.deployNFT(name, "", uri, benefitUri, []);
    transaction = await contract
      .connect(wallet)
      .deployNFT(name, "", uri, benefitUri, [], {
        gasLimit: gas,
      });
    const deployedInfo = await getDeployedAddress(transaction);
    while (typeof deployedInfo.contractAddress == "string") {
      const deployedInfo = await getDeployedAddress(transaction);
      return deployedInfo;
    }

    const data = {
      contractAddress: deployedInfo.contractAddress,
      transactionHash: deployedInfo.transactionHash,
      date: deployedInfo.date,
    };
    return data;
  } catch (error) {
    throw error;
  }
};

const mintMumbaiNFT = async (nft: any, address: string) => {
  const transaction = await nft.connect(wallet).mint(address);
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
};

const transferMumbaiNFT = async (
  nft: ethers.Contract,
  id: number,
  from: string,
  to: string
) => {
  const transaction = await nft.connect(wallet).transferFrom(from, to, id);
  const rc = await transaction.wait();
  const data = {
    transactionHash: rc.transactionHash,
  };

  return data;
};

export { deployMumbaiNFT, polygonProvider, mintMumbaiNFT, transferMumbaiNFT };
