// const { ethers } = require("ethers");
// require("dotenv").config();

// const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
// const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// const contractAddress = "YOUR_CONTRACT";
// const abi = [
//   "function storeData(string memory data) public",
//   "function getData() public view returns(string memory)"
// ];

// const contract = new ethers.Contract(contractAddress, abi, wallet);

// polygon.js — simulation mode (no wallet needed)
async function writePolygon(data) {
  const delay = Math.floor(Math.random() * (200 - 100 + 1)) + 100; // 100-200ms
  await new Promise(resolve => setTimeout(resolve, delay));
  return { txHash: "poly_tx_" + Date.now(), data, status: "confirmed" };
}

async function readPolygon() {
  const delay = Math.floor(Math.random() * (100 - 40 + 1)) + 40; // 40-100ms
  await new Promise(resolve => setTimeout(resolve, delay));
  return { value: "drug_data_from_polygon", status: "success" };
}

module.exports = { writePolygon, readPolygon };