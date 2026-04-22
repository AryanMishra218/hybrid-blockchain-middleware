const { Gateway, Wallets } = require('fabric-network');

async function connectFabric() {
  // simplified (use your connection profile)
}

async function writeFabric(data) {
  const contract = await connectFabric();
  await contract.submitTransaction('CreateAsset', data);
  return "fabric_tx_success";
}

async function readFabric() {
  const contract = await connectFabric();
  return await contract.evaluateTransaction('ReadAsset');
}

module.exports = { writeFabric, readFabric };