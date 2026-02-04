import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();

import projectsRouter from './routes/projects';

app.use(cors());
app.use(express.json());

// Serve project assets directly from the root /projects folder (single source of truth)
// URL: /assets/{projectId}/assets/{type}/{filename}
// Maps to: /projects/{projectId}/assets/{type}/{filename}
app.use('/assets', express.static(path.resolve(process.cwd(), '../../projects')));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/projects', projectsRouter);

export default app;
