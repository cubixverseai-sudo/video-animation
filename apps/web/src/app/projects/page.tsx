"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, FolderOpen, Clock, MoreVertical, LayoutGrid, List as ListIcon, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/stores/projectStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// --- TYPES ---
interface Project {
    id: string;
    name: string;
    description?: string;
    updatedAt: string;
    status: 'draft' | 'generating' | 'completed' | 'error';
}

// --- COMPONENTS ---

function ProjectCard({ project }: { project: Project }) {
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-[#0A0A0A] border border-white/5 hover:border-indigo-500/30 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 overflow-hidden"
            onClick={() => router.push(`/studio/${project.id}`)}
        >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-indigo-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-indigo-500/5 transition-colors duration-500" />

            <div className="relative flex flex-col h-full justify-between gap-4">
                <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                        <FolderOpen className="w-5 h-5 text-indigo-400" />
                    </div>
                    <button className="p-1 hover:bg-white/10 rounded-lg transition-colors text-zinc-500 hover:text-white">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>

                <div>
                    <h3 className="text-white font-semibold text-lg tracking-tight group-hover:text-indigo-300 transition-colors mb-1 truncate">
                        {project.name}
                    </h3>
                    <p className="text-zinc-500 text-xs line-clamp-2 min-h-[2.5em] leading-relaxed">
                        {project.description || "No description provided."}
                    </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-mono uppercase tracking-wider">
                        <Clock className="w-3 h-3" />
                        {new Date(project.updatedAt).toLocaleDateString()}
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${project.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                        {project.status}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function CreateProjectModal({ isOpen, onClose, onCreate }: { isOpen: boolean, onClose: () => void, onCreate: (name: string, desc: string) => void }) {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) onCreate(name, desc);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-md bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6 shadow-2xl"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Zap className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">New Project</h2>
                        <p className="text-xs text-zinc-400">Initialize a new creative workspace</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Project Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Cyberpunk Intro"
                            className="w-full bg-[#050505] border border-[#1F1F1F] rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:border-indigo-500 outline-none transition-colors"
                            autoFocus
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Description (Optional)</label>
                        <textarea
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            placeholder="Brief context about this project..."
                            className="w-full bg-[#050505] border border-[#1F1F1F] rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:border-indigo-500 outline-none transition-colors min-h-[80px]"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-xl transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={!name.trim()} className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 transition-all">
                            Create Project
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// --- MAIN PAGE ---

export default function ProjectsPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    // Fetch projects
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch('http://localhost:4000/projects');
                if (res.ok) {
                    const data = await res.json();
                    setProjects(data);
                }
            } catch (err) {
                console.error("Failed to fetch projects", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const handleCreate = async (name: string, description: string) => {
        try {
            const res = await fetch('http://localhost:4000/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description })
            });
            if (res.ok) {
                const newProject = await res.json();
                router.push(`/studio/${newProject.id}`);
            }
        } catch (err) {
            console.error("Failed to create project", err);
        }
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#030303] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-[#030303]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold tracking-tight">DIRECTOR</span>
                        </Link>
                        <nav className="hidden md:flex items-center gap-6">
                            <a href="#" className="text-sm font-medium text-white">Projects</a>
                            <a href="#" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Assets</a>
                            <a href="#" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Settings</a>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search projects..."
                                className="bg-[#0A0A0A] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:border-indigo-500 outline-none w-64 transition-all"
                            />
                        </div>
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="bg-white text-black hover:bg-gray-100 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Project</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold">Recent Projects</h1>
                    <div className="flex items-center bg-[#0A0A0A] rounded-lg p-1 border border-white/5">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn("p-2 rounded-md transition-all", viewMode === 'grid' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300")}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn("p-2 rounded-md transition-all", viewMode === 'list' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300")}
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-96 border border-dashed border-white/10 rounded-2xl bg-[#0A0A0A]/30">
                        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                            <FolderOpen className="w-8 h-8 text-zinc-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No projects yet</h3>
                        <p className="text-zinc-500 mb-6 max-w-sm text-center">Start your first creative journey by creating a new project.</p>
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                            Create a project &rarr;
                        </button>
                    </div>
                ) : (
                    <div className={cn(
                        "grid gap-6",
                        viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                    )}>
                        {filteredProjects.map(project => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                )}
            </main>

            <CreateProjectModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreate={handleCreate}
            />
        </div>
    );
}
