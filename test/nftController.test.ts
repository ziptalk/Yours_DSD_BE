import {
  deleteUserNftInfo,
  getUserNftInfo,
  integrateNft,
  mintNft,
} from "../src/controller/nftController";
import { statusCode, responseMessage } from "../src/module";
import { nftService } from "../src/service";

describe("mintNft : api/nft/own", () => {
  const expectedData = {
    userId: 1,
    nftGrade: "tt",
  };
  const expectedResponse = {
    status: statusCode.OK,
    success: true,
    message: responseMessage.SUCCESS,
    data: expectedData,
  };
  const req: any = {
    body: {
      userId: 1,
      nftGrade: "tt",
    },
  };
  const res: any = {
    status: jest.fn(() => res),
    send: jest.fn(),
  };
  const next = jest.fn();
  test("mintNft 정상 작동 테스트", async () => {
    nftService.saveMintInfo = jest.fn().mockResolvedValue(expectedData);
    await mintNft(req, res, next);
    expect(res.status).toBeCalledWith(statusCode.OK);
    expect(res.send).toBeCalledWith(expectedResponse);
  });
});

describe("integrateNft : api/nft/integrate", () => {
  const expectedData = {
    data: {
      userId: 1,
      name: "SS",
    },
  };
  const expectedResponse = {
    status: statusCode.OK,
    success: true,
    message: responseMessage.SUCCESS,
    data: expectedData,
  };

  const req: any = {
    body: {
      userId: 1,
      oldNfts: ["B", "B"],
      newNft: "SS",
    },
  };

  const res: any = {
    status: jest.fn(() => res),
    send: jest.fn(),
  };

  const next = jest.fn();

  test("integrateNft 정상 작동 테스트", async () => {
    nftService.deleteManyMintInfo = jest.fn();
    nftService.saveMintInfo = jest.fn().mockReturnValue(expectedData);
    await integrateNft(req, res, next);
    expect(res.status).toBeCalledWith(statusCode.OK);
    expect(res.send).toBeCalledWith(expectedResponse);
  });
});

describe("getUserNftInfo api/nft/own/:userId", () => {
  const req: any = {
    params: { id: 1 },
  };
  const res: any = {
    status: jest.fn(() => res),
    send: jest.fn(),
  };

  const next = jest.fn();
  test("getUserNftInfo 정상 작동 테스트", async () => {
    nftService.getUserNftByUserId = jest.fn();
    await getUserNftInfo(req, res, next);
    expect(res.status).toBeCalledWith(statusCode.OK);
  });
});


