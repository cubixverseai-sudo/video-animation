import { Router } from 'express';
import { projectManager } from '../managers/ProjectManager';

const router = Router();

// GET /projects - List all projects
router.get('/', async (req, res) => {
    try {
        const projects = await projectManager.listProjects();
        res.json(projects);
    } catch (error) {
        console.error('Failed to list projects:', error);
        res.status(500).json({ error: 'Failed to list projects' });
    }
});

import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

// POST /projects - Create a new project (with optional assets)
router.post('/', upload.array('assets'), async (req, res) => {
    try {
        const { name, description } = req.body;
        const project = await projectManager.createProject(name, description);

        const files = req.files as Express.Multer.File[];
        const assetPaths: string[] = [];

        if (files && files.length > 0) {
            for (const file of files) {
                const publicPath = await projectManager.saveAsset(project.id, file);
                assetPaths.push(publicPath);
            }
        }

        res.status(201).json({ ...project, assets: assetPaths });
    } catch (error) {
        console.error('Failed to create project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// GET /projects/:id - Get project details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const project = await projectManager.getProject(id);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        console.error('Failed to get project:', error);
        res.status(500).json({ error: 'Failed to get project details' });
    }
});

// PATCH /projects/:id - Update project
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const project = await projectManager.updateProject(id, updates);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        console.error('Failed to update project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

// POST /projects/:id/assets - Upload an asset to an existing project
router.post('/:id/assets', upload.single('asset'), async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const publicPath = await projectManager.saveAsset(id as string, file);
        res.json({ path: publicPath });
    } catch (error) {
        console.error('Failed to upload asset:', error);
        res.status(500).json({ error: 'Failed to upload asset' });
    }
});

export default router;
