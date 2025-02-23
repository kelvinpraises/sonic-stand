import { PinataSDK } from "pinata-web3";

export const createPinataSDK = (customJwt?: string) => {
  return new PinataSDK({
    pinataJwt: customJwt || `${process.env.PINATA_JWT}`,
    pinataGateway: `${process.env.NEXT_PUBLIC_GATEWAY_URL}`,
  });
};

export const pinata = createPinataSDK();
