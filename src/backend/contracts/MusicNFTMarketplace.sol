// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MusicNFTMarketplace is ERC721URIStorage, Ownable {
    uint256 public royaltyFee = 0.001e18;
    address payable creator;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _addresses;

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        uint256 price;
    }

    event MarketItemBought(
        uint256 indexed tokenId,
        address indexed seller,
        address buyer,
        uint256 price
    );

    event MarketItemRelisted(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );

    constructor() ERC721("MusicNFTMarketplace", "MNFT") {
        creator = payable(msg.sender);
    }

    mapping(uint256 => MarketItem) private idToMarketItem;
    mapping(uint256 => address) addresses;

    function updateRoyaltyFee(uint256 _royaltyFee) external onlyOwner {
        royaltyFee = _royaltyFee;
    }

    function getRoyaltyFee() public view returns (uint256) {
        return royaltyFee;
    }

    function getMarketItemByTokenId(uint256 tokenId)
        public
        view
        returns (MarketItem memory)
    {
        return idToMarketItem[tokenId];
    }

    function createToken(string memory tokenURI, uint256 price)
        public
        payable
        returns (uint256)
    {
        require(msg.value == royaltyFee, "Send enough ether to list");
        require(price > 0, "Price must be greater than 0");
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        idToMarketItem[newTokenId] = MarketItem(
            newTokenId,
            payable(address(msg.sender)),
            price
        );
        _transfer(msg.sender, address(this), newTokenId);
        return newTokenId;
    }

    function buyToken(uint256 tokenId) external payable {
        uint256 price = idToMarketItem[tokenId].price;
        address seller = idToMarketItem[tokenId].seller;
        require(
            msg.value == price,
            "Please send the asking price in order to complete the purchase"
        );
        idToMarketItem[tokenId].seller = payable(address(0));
        _transfer(address(this), msg.sender, tokenId);
        approve(address(this), tokenId);
        payable(creator).transfer(royaltyFee);
        payable(seller).transfer(msg.value);
        emit MarketItemBought(tokenId, seller, msg.sender, price);
    }

    function resellToken(uint256 tokenId, uint256 price) external payable {
        require(msg.value == royaltyFee, "Must pay royalty");
        require(price > 0, "Price must be greater than zero");
        idToMarketItem[tokenId].price = price;
        idToMarketItem[tokenId].seller = payable(msg.sender);

        _transfer(msg.sender, address(this), tokenId);
        emit MarketItemRelisted(tokenId, msg.sender, price);
    }

    function getAllUnsoldTokens() external view returns (MarketItem[] memory) {
        uint256 itemsCount = _tokenIds.current();
        uint256 unsoldCount = balanceOf(address(this));
        MarketItem[] memory tokens = new MarketItem[](unsoldCount);
        uint256 currentIndex;
        for (uint256 i = 0; i < itemsCount; i++) {
            if (idToMarketItem[i + 1].seller != address(0)) {
                tokens[currentIndex] = idToMarketItem[i + 1];
                currentIndex++;
            }
        }
        return (tokens);
    }

    function getMyTokens() external view returns (MarketItem[] memory) {
        uint256 itemsCount = _tokenIds.current();
        uint256 myTokenCount = balanceOf(msg.sender);
        MarketItem[] memory tokens = new MarketItem[](myTokenCount);
        uint256 currentIndex;
        for (uint256 i = 0; i < itemsCount; i++) {
            if (ownerOf(i + 1) == msg.sender) {
                tokens[currentIndex] = idToMarketItem[i + 1];
                currentIndex++;
            }
        }
        return (tokens);
    }

    function checkIsOwner() external view returns (bool) {
        return address(msg.sender) == address(creator);
    }

    function createNewArtist(address newAddress)
        external
        onlyOwner
        returns (uint256)
    {
        _addresses.increment();
        uint256 addressIndex = _addresses.current();
        addresses[addressIndex] = address(newAddress);
        return addressIndex;
    }

    function checkArtistExisted(address addressNeedCheck)
        public
        view
        returns (bool)
    {
        uint256 addressCount = _addresses.current();
        for (uint256 i = 0; i < addressCount; i++) {
            if (addresses[i] == address(addressNeedCheck)) {
                return true;
            }
        }
        return false;
    }
}
