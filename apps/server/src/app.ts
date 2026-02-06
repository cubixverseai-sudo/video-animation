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

// Serve rendered exports for download
// URL: /exports/{filename}
// Maps to: /exports/{filename}
app.use('/exports', express.static(path.resolve(process.cwd(), '../../exports'), {
    setHeaders: (res, filePath) => {
        // Force download instead of playing in browser
        res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
    }
}));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/projects', projectsRouter);

export default app;
