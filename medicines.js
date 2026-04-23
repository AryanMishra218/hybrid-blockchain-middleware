// medicines.js
// Reads medicine data from medicines.csv
// To add/remove medicines → just edit the CSV file

const fs   = require("fs");
const path = require("path");

// Read and parse CSV file
function loadMedicines() {
  const filePath = path.join(__dirname, "medicines.csv");
  const content  = fs.readFileSync(filePath, "utf-8");

  const lines    = content.trim().split("\n");  // split into rows
  const headers  = lines[0].split(",");         // first row = column names

  // Convert each row into an object
  return lines.slice(1).map(line => {
    const values = line.split(",");
    const obj    = {};
    headers.forEach((header, i) => {
      obj[header.trim()] = values[i]?.trim();
    });
    return obj;
  });
}

// Load medicines once when server starts
const medicines = loadMedicines();
console.log(`✅ Loaded ${medicines.length} medicines from CSV`);

// Returns one random medicine with a unique transaction ID
function getRandomMedicine() {
  const med  = medicines[Math.floor(Math.random() * medicines.length)];
  const txId = Math.random().toString(36).substr(2, 8).toUpperCase();

  return {
    drug_name:    med.drug_name,
    batch_number: med.batch + "-" + txId,   // unique per transaction
    manufacturer: med.manufacturer,
    expiry_date:  med.expiry,
    dosage:       med.dose,
    timestamp:    new Date().toISOString(),
    verified:     false
  };
}

module.exports = { getRandomMedicine };