require("dotenv").config();

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);