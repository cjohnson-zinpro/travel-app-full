import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Serve static files from the client directory
app.use(express.static(join(__dirname, 'client')));

// Serve the main page
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'client', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Development server running on http://localhost:${PORT}`);
});