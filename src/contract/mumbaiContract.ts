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

const deployMumbaiNFT = async (name: string | null, uri: string | null) => {
  let rc;
  try {
    const gas = await contract.connect(wallet).estimateGas.deployNFT(name, uri);
    console.log("Gas :", gas);
    const tx = await contract.connect(wallet).deployNFT(name, uri, {
      gasLimit: gas,
    });
    rc = await tx.wait();
  } catch (error) {
    console.log(error);
    console.log("전체 함수 중지");
  }

  const addr = await getDeployedAddress(rc);

  return addr;
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
