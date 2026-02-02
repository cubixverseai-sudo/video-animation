"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image as ImageIcon, Music, X, Plus, File } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AssetDropzoneProps {
    onAssetsChange: (files: File[]) => void;
}

export const AssetDropzone: React.FC<AssetDropzoneProps> = ({ onAssetsChange }) => {
    const [files, setFiles] = useState<File[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = [...files, ...acceptedFiles];
        setFiles(newFiles);
        onAssetsChange(newFiles);
    }, [files, onAssetsChange]);

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        onAssetsChange(newFiles);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.svg'],
            'audio/*': ['.mp3', '.wav']
        }
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-widest text-[#555566] font-bold">Assets & Media</span>
                <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="flex flex-wrap gap-3">
                <AnimatePresence>
                    {files.map((file, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative group w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden"
                        >
                            {file.type.startsWith('image/') ? (
                                <img
                                    src={URL.createObjectURL(file)}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                    alt="preview"
                                />
                            ) : (
                                <Music className="w-6 h-6 text-indigo-400 opacity-60" />
                            )}

                            <button
                                onClick={() => removeFile(idx)}
                                className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-2 h-2 text-white" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                <div
                    {...getRootProps()}
                    className={`w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                        }`}
                >
                    <input {...getInputProps()} />
                    <Plus className="w-5 h-5 text-zinc-500" />
                </div>
            </div>

            {files.length === 0 && (
                <p className="text-[10px] text-zinc-500 italic">Optional: Drop logos, photos or music here to guide the AI.</p>
            )}
        </div>
    );
};
