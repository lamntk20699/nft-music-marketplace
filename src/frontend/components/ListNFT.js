import * as ethers from "ethers";
import { useContext, useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import { storeFileAndMetadata } from "../api";
import { AppContext } from "./App";

export default function ListNFT() {
  const [formParams, updateFormParams] = useState({
    name: "",
    description: "",
    artist: "",
    price: "",
  });
  const [message, updateMessage] = useState("");
  const [file, setFile] = useState();
  const navigate = useNavigate();
  const { contract } = useContext(AppContext);

  const changeFile = async (e) => {
    const file = e.target.files[0];
    setFile(file);
  };

  const changeName = (e) => {
    updateFormParams({ ...formParams, name: e.target.value });
  };

  const changeDescription = (e) => {
    updateFormParams({ ...formParams, description: e.target.value });
  };

  const changePrice = (e) => {
    updateFormParams({ ...formParams, price: e.target.value });
  };

  const changeArtist = (e) => {
    updateFormParams({ ...formParams, artist: e.target.value });
  };

  const uploadFileAndMetadata = async () => {
    const { name, description, price, artist } = formParams;
    if (!name || !description || !price || !artist) {
      return;
    }

    const result = await storeFileAndMetadata(file, {
      name,
      description,
      price,
      artist,
    });

    return result.metadataGatewayURI;
  };

  const listNFT = async (e) => {
    e.preventDefault();

    try {
      updateMessage(
        "Please wait for uploading data and then metamask will open to perform this action"
      );
      const metadataURI = await uploadFileAndMetadata();
      const price = ethers.utils.parseUnits(formParams.price, "ether");
      let royaltyFee = await contract.getRoyaltyFee();
      royaltyFee = royaltyFee.toString();

      const transaction = await contract.createToken(metadataURI, price, {
        value: royaltyFee,
      });
      await transaction.wait();

      alert("Upload successfully");
      updateMessage("");
      updateFormParams({ name: "", description: "", price: "", artist: "" });
      navigate("/");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="mt-5 container">
      <div className="row">
        <div className="col-6 offset-3">
          <form
            className="d-flex flex-column align-items-stretch p-4 rounded"
            style={{ backgroundColor: "#f7f7f9" }}
          >
            <h3 className="">UPLOAD NFT</h3>
            <div className="d-flex flex-column align-items-start mt-3">
              <label className="2" htmlFor="name">
                NFT Name
              </label>
              <input
                className="mt-1 w-100 form-control"
                id="name"
                type="text"
                placeholder="NFT name"
                onChange={changeName}
                value={formParams.name}
              ></input>
            </div>
            <div className="d-flex flex-column align-items-start mt-3">
              <label className="2" htmlFor="name">
                Artist
              </label>
              <input
                className="mt-1 w-100 form-control"
                id="artist"
                type="text"
                placeholder="Artist"
                onChange={changeArtist}
                value={formParams.artist}
              ></input>
            </div>
            <div className="d-flex flex-column align-items-start mt-3">
              <label className="2" htmlFor="description">
                NFT Description
              </label>
              <textarea
                className="mt-1 w-100 form-control"
                cols="40"
                rows="5"
                id="description"
                type="text"
                placeholder="NFT description"
                value={formParams.description}
                onChange={changeDescription}
              ></textarea>
            </div>
            <div className="d-flex flex-column align-items-start mt-3">
              <label className="2" htmlFor="price">
                Price
              </label>
              <input
                className="mt-1 w-100 form-control"
                type="number"
                placeholder="0.001"
                step="0.01"
                value={formParams.price}
                onChange={changePrice}
              ></input>
            </div>
            <div className="d-flex flex-column align-items-start mt-3">
              <label className="2" htmlFor="image">
                Upload Song
              </label>
              <input
                type="file"
                className="form-control mt-1"
                onChange={changeFile}
              ></input>
            </div>
            <br></br>
            <Button
              onClick={listNFT}
              disabled={!file}
              className="btn btn-warning"
            >
              List NFT
            </Button>
            <div className="text-danger">{message}</div>
          </form>
        </div>
      </div>
    </div>
  );
}
