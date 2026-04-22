const axios = require("axios");

async function runTest(count) {
  const start = Date.now();

  let promises = [];

  const batchSize = 10;

    for (let i = 0; i < count; i += batchSize) {
    let batch = [];

    for (let j = i; j < i + batchSize && j < count; j++) {
        batch.push(
        axios.post("http://localhost:3000/write", {
            data: "drug_" + j,
            target: "polygon"
        })
        );
    }

    await Promise.all(batch);
    }

  await Promise.all(promises);

  const end = Date.now();

  console.log("Total Time:", end - start);
  console.log("Avg Time:", (end - start) / count);
}

runTest(500); // change to 1000