import { ethers } from "ethers";
import { useContext, useState } from "react";
import { Button } from "react-bootstrap";
import { AppContext } from "./App";

export default function Setting() {
  const { contract } = useContext(AppContext);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const addArtist = async () => {
    if (!address) return;
    try {
      setLoading(true);
      const converttedAddress = ethers.utils.getAddress(address);
      const isArtistExisted = await contract.checkArtistExisted(
        converttedAddress
      );
      console.log(isArtistExisted);
      if (isArtistExisted) {
        alert("Artist already exists");
      } else {
        const transaction = await contract.createNewArtist(converttedAddress);
        const id = await transaction.wait();
        console.log(id);
        alert("Created artist successfully");
      }
    } catch (e) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center w-75 m-auto mt-5">
      <form
        className="d-flex flex-column align-items-stretch p-4 rounded"
        style={{ backgroundColor: "#f7f7f9" }}
      >
        <h3 className="">ADD ARTIST</h3>
        <div className="d-flex flex-column align-items-start mt-3">
          <label className="2" htmlFor="name">
            Address
          </label>
          <input
            className="mt-1 w-100 form-control"
            id="name"
            type="text"
            placeholder="NFT name"
            onChange={(e) => setAddress(e.target.value)}
            value={address}
          ></input>
        </div>
        <br></br>
        <Button onClick={addArtist} className="btn btn-warning">
          List NFT
        </Button>
        {loading && "Waiting..."}
      </form>
    </div>
  );
}
