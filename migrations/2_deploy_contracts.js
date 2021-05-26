const WishList = artifacts.require("WishList");

module.exports = function(deployer) {
  deployer.deploy(WishList);
};
