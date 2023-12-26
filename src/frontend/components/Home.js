import { ethers } from "ethers";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import { getTokenInfo } from "../utils";
import { AppContext } from "./App";
import { useNavigate } from "react-router";

const Home = () => {
  const audioRefs = useRef([]);
  const [isPlaying, setIsPlaying] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(0);
  const [previous, setPrevious] = useState(null);
  const [marketItems, setMarketItems] = useState(null);
  const navigate = useNavigate();

  const { contract, account } = useContext(AppContext);

  const loadMarketplaceItems = useCallback(async () => {
    const unsoldTokens = await contract.getAllUnsoldTokens();
    const marketItems = await Promise.all(
      unsoldTokens.map(async (token) => getTokenInfo(token, contract))
    );
    setMarketItems(marketItems);
    setLoading(false);
  }, [contract]);

  const buyMarketItem = useCallback(
    async (item) => {
      try {
        await (
          await contract.buyToken(item.tokenId, {
            value: item.price,
          })
        ).wait();
        loadMarketplaceItems();
        alert("Buy token successfully");
      } catch (e) {
        alert("Something went wrong");
        console.log(e);
      }
      navigate("/my-tokens");
    },
    [contract, loadMarketplaceItems]
  );

  useEffect(() => {
    if (contract) {
      loadMarketplaceItems();
    }
  }, [contract, loadMarketplaceItems]);

  useEffect(() => {
    if (isPlaying) {
      audioRefs.current[selected].play();
      if (selected !== previous) audioRefs.current[previous].pause();
    } else if (isPlaying !== null) {
      audioRefs.current[selected].pause();
    }
  });

  if (loading)
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
      </main>
    );

  return (
    <div className="flex justify-center">
      {marketItems.length > 0 ? (
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {marketItems.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <audio
                  src={item.audio}
                  key={idx}
                  ref={(el) => (audioRefs.current[idx] = el)}
                ></audio>
                <Card>
                  <Card.Img variant="top" src={item.identicon} />
                  <Card.Body>
                    <Card.Title>
                      {item.name} ({item.artist})
                    </Card.Title>
                    <p>{item.description}</p>
                    <div className="d-grid px-4">
                      <Button
                        className="btn btn-warning"
                        onClick={() => {
                          setPrevious(selected);
                          setSelected(idx);
                          if (!isPlaying || idx === selected)
                            setIsPlaying(!isPlaying);
                        }}
                      >
                        {isPlaying && selected === idx ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="23"
                            height="23"
                            fill="currentColor"
                            className="bi bi-pause"
                            viewBox="0 0 16 16"
                          >
                            <path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5zm4 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5z" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="23"
                            height="23"
                            fill="currentColor"
                            className="bi bi-play"
                            viewBox="0 0 16 16"
                          >
                            <path d="M10.804 8 5 4.633v6.734L10.804 8zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692z" />
                          </svg>
                        )}
                      </Button>
                    </div>
                    <Card.Text className="mt-1">
                      {ethers.utils.formatEther(item.price)} BNB
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    {item.seller === account ? (
                      <p className="text-danger font-weight-bold">
                        You are the seller of this token (
                        {ethers.utils.formatEther(item.price)})
                      </p>
                    ) : (
                      <Button
                        onClick={() => buyMarketItem(item)}
                        className="btn btn-warning"
                        size="lg"
                      >
                        {`Buy for ${ethers.utils.formatEther(item.price)} BNB`}
                      </Button>
                    )}
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <main style={{ padding: "1rem 0" }}>
          <h2>No tokens</h2>
        </main>
      )}
    </div>
  );
};
export default Home;
