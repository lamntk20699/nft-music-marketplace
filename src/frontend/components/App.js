import { Link, BrowserRouter, Routes, Route } from "react-router-dom";

import { Spinner, Navbar, Nav, Button, Container } from "react-bootstrap";
import Home from "./Home.js";
import MyTokens from "./MyTokens.js";
import MyResales from "./MyResales.js";
import "./App.css";

import { createContext, useCallback, useEffect, useState } from "react";
import { ethers, utils } from "ethers";
import MusicNFTMarketplaceContract from "../contractsData/Marketplace.json";
import ListNFT from "./ListNFT";
import Setting from "./Setting.js";

export const AppContext = createContext({});

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState({});
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isArtist, setIsArtist] = useState(false);

  const web3Handler = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = utils.getAddress(accounts?.[0]);
    setAccount(account);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    loadContract(signer);
  };

  const loadContract = async (signer) => {
    const contract = new ethers.Contract(
      MusicNFTMarketplaceContract.address,
      MusicNFTMarketplaceContract.abi,
      signer
    );
    setContract(contract);
    setLoading(false);
  };

  const checkIsOwner = useCallback(() => {
    return contract.checkIsOwner();
  }, [contract]);

  const checkAccountIsArtist = useCallback(() => {
    return contract.checkArtistExisted(account);
  }, [contract, account]);

  useEffect(() => {
    web3Handler();
    window.ethereum.on("accountsChanged", async function () {
      await web3Handler();
    });
  }, []);

  useEffect(() => {
    if (account) {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => {
    if (Object.keys(contract).length) {
      checkIsOwner().then(setIsOwner);
    }
  }, [contract]);

  useEffect(() => {
    if (account && Object.keys(contract).length) {
      checkAccountIsArtist(account).then(setIsArtist);
    }
  }, [account, contract]);

  return (
    <AppContext.Provider
      value={{
        account,
        contract,
        loading,
        setAccount,
        setContract,
        setLoading,
      }}
    >
      <BrowserRouter>
        <div className="App">
          <>
            <Navbar expand="lg" bg="dark" variant="dark">
              <Container>
                <Navbar.Brand href="/">Music NFT Marketplace</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                  <Nav className="me-auto">
                    <Nav.Link as={Link} to="/">
                      HOME
                    </Nav.Link>
                    <Nav.Link as={Link} to="/my-tokens">
                      MY TOKENS
                    </Nav.Link>
                    <Nav.Link as={Link} to="/my-resales">
                      MY RESALES
                    </Nav.Link>
                    {isArtist && (
                      <Nav.Link as={Link} to="/list-nft">
                        LIST NFT
                      </Nav.Link>
                    )}
                    {isOwner && (
                      <Nav.Link as={Link} to="/setting">
                        SETTING
                      </Nav.Link>
                    )}
                  </Nav>
                  <Nav>
                    {account ? (
                      <Nav.Link
                        href={`https://etherscan.io/address/${account}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button nav-button btn-sm mx-4"
                      >
                        <Button className="btn btn-warning">
                          {account.slice(0, 5) + "..." + account.slice(38, 42)}
                        </Button>
                      </Nav.Link>
                    ) : (
                      <Button onClick={web3Handler} variant="outline-light">
                        Connect Wallet
                      </Button>
                    )}
                  </Nav>
                </Navbar.Collapse>
              </Container>
            </Navbar>
          </>
          <div>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "80vh",
                }}
              >
                <Spinner animation="border" style={{ display: "flex" }} />
                <p className="mx-3 my-0">Awaiting Metamask Connection...</p>
              </div>
            ) : (
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/my-tokens" element={<MyTokens />} />
                <Route path="/my-resales" element={<MyResales />} />
                <Route path="/my-resales" element={<MyResales />} />
                {isArtist && <Route path="/list-nft" element={<ListNFT />} />}
                {isOwner && <Route path="/setting" element={<Setting />} />}
              </Routes>
            )}
          </div>
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;
