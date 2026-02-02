import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();

import projectsRouter from './routes/projects';

app.use(cors());
app.use(express.json());

// Assets Serving
app.use('/storage', express.static(path.join(process.cwd(), 'storage')));
// Mirror serving for remotion
app.use('/assets', express.static(path.resolve(process.cwd(), '../../packages/remotion-core/public/assets')));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/projects', projectsRouter);

export default app;
