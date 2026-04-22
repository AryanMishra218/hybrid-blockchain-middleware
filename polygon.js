const { ethers } = require("ethers");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contractAddress = "YOUR_CONTRACT";
const abi = [
  "function storeData(string memory data) public",
  "function getData() public view returns(string memory)"
];

const contract = new ethers.Contract(contractAddress, abi, wallet);

async function writePolygon(data) {
  const tx = await contract.storeData(data);
  await tx.wait();
  return tx.hash;
}

async function readPolygon() {
  return await contract.getData();
}

module.exports = { writePolygon, readPolygon };