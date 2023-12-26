import { Web3Storage } from "web3.storage";

function makeStorageClient() {
  return new Web3Storage({ token: process.env.REACT_APP_WEB3_STORAGE_API_KEY });
}

function createJsonFile(filename, obj) {
  return new File([JSON.stringify(obj)], filename);
}

export function makeGatewayURL(cid, path) {
  if (!cid) return path;
  return `https://${cid}.ipfs.dweb.link/${encodeURIComponent(path)}`;
}

export function getCID(url) {
  const regx = /(https:\/\/)(\w+)(.ipfs.dweb.link)/;
  const match = url.match(regx);
  return match ? match[2] : "";
}

export async function storeFileAndMetadata(file, nftInfo) {
  const uploadName = ["btl", nftInfo.name, new Date().toString()].join("-");
  const fileNameEncode = encodeURIComponent(file.name);
  const client = makeStorageClient();

  const metadataFile = createJsonFile("metadata.json", {
    ...nftInfo,
    path: fileNameEncode,
  });

  const cid = await client.put([file, metadataFile], {
    name: uploadName,
  });
  const metadataGatewayURI = makeGatewayURL(cid, "metadata.json");
  const audioGatewayURI = makeGatewayURL(cid, file.name);
  const audioURI = `ipfs://${cid}/${fileNameEncode}`;
  const metadataURI = `ipfs://${cid}/metadata.json`;
  return {
    cid,
    metadataURI,
    metadataGatewayURI,
    audioURI,
    audioGatewayURI,
  };
}

