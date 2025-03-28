require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.0",
  defaultNetwork: "holesky",
  networks: {
    holesky: {
      url: "https://ethereum-holesky.publicnode.com",
      accounts: [process.env.PRIVATE_KEY || "your_private_key_here"],
      chainId: 17000 
    }
  },

};