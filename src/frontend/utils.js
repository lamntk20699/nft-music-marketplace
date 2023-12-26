import Identicon from "identicon.js";
import { getCID, makeGatewayURL } from "./api";

export async function getTokenInfo(token, contract) {
  try {
    const { tokenId, price, seller } = token;
    const uri = await contract.tokenURI(tokenId);
    const response = await fetch(uri);
    const metadata = await response.json();
    const identicon = `data:image/png;base64,${new Identicon(
      metadata.name + metadata.price + new Date().toString(),
      330
    ).toString()}`;
    const cid = getCID(uri);
    const audio = makeGatewayURL(cid, metadata.path);

    let tokenInfo = {
      price,
      tokenId,
      seller,
      description: metadata.description,
      artist: metadata.artist,
      name: metadata.name,
      audio,
      identicon,
    };
    return tokenInfo;
  } catch (e) {
    console.log(e);
  }
}