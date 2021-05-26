pragma solidity ^0.5.0;

contract WishList {
  uint public giftCount = 0;

  struct Gift {
    uint id;
    string content;
    bool received;
  }

  mapping(uint => Gift) public gifts;

  event GiftCreated(
    uint id,
    string content,
    bool received
  );

  event GiftReceived(
    uint id,
    bool received
  );

  constructor() public {
    createGift("Fairy Lights");
  }

  function createGift(string memory _content) public {
    giftCount ++;
    gifts[giftCount] = Gift(giftCount, _content, false);
    emit GiftCreated(giftCount, _content, false);
  }

  function toggleReceived(uint _id) public {
    Gift memory _gift = gifts[_id];
    _gift.received = !_gift.received;
    gifts[_id] = _gift;
    emit GiftReceived(_id, _gift.received);
  }

}