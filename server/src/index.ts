import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { notebooksRouter } from './routes/notebooks.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Try multiple possible .env locations (works for both tsx dev and compiled dist/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/notebooks', notebooksRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
