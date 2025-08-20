const express = require('express');
const fs = require('fs');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;
const DATA_FILE = './assets.json';

// Middleware
app.use(cors());
app.use(express.json());

// Load assets data from file or initialize empty
function loadAssets() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return data ? JSON.parse(data) : [];
}

// Save assets data to file
function saveAssets(assets) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(assets, null, 2));
}

// API routes

// Get all assets
app.get('/assets', (req, res) => {
  const assets = loadAssets();
  res.json(assets);
});

// Add new asset
app.post('/assets', (req, res) => {
  const { name, category, link, uploader } = req.body;
  if (!name || !category || !link || !uploader) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const assets = loadAssets();
  const newAsset = { id: uuidv4(), name, category, link, uploader };
  assets.unshift(newAsset);
  saveAssets(assets);

  res.status(201).json(newAsset);
});

// Delete asset by ID and uploader verification
app.delete('/assets/:id', (req, res) => {
  const assetId = req.params.id;
  const { uploader } = req.body;

  if (!uploader) {
    return res.status(400).json({ message: 'Uploader name is required for deletion' });
  }

  const assets = loadAssets();
  const assetIndex = assets.findIndex(a => a.id === assetId);

  if (assetIndex === -1) {
    return res.status(404).json({ message: 'Asset not found' });
  }

  if (assets[assetIndex].uploader !== uploader) {
    return res.status(403).json({ message: 'Not authorized to delete this asset' });
  }

  assets.splice(assetIndex, 1);
  saveAssets(assets);

  res.json({ message: 'Asset deleted successfully' });
});

// Start server
app.listen(PORT, () => {
  console.log(`ACSHO backend running at http://localhost:${PORT}`);
});
