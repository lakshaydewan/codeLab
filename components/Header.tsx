import React from 'react';
import {
    Save,
    RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { useFileSystemStore } from '@/store/fileSystemStore';
import { useParams, useRouter } from 'next/navigation';
import type { FileSystemTree } from '@webcontainer/api';
import { IconArrowLeft, IconLoader } from '@tabler/icons-react';
import { useWebContainer } from '@/app/hooks/useContainer';

const Header: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const { files } = useFileSystemStore();
    const templateID = params.templateId;
    const filteredFiles = excludeNodeModules(files);
    const [loading, setLoading] = React.useState(false);
    const { webContainer } = useWebContainer(); 

    function excludeNodeModules(files: FileSystemTree): FileSystemTree {
        const filteredFiles: FileSystemTree = {};
        // Iterate through each file in the files object
        for (const [key, value] of Object.entries(files)) {
            if (key === 'node_modules') {
                // Skip the node_modules directory
                continue;
            }
            filteredFiles[key] = value;
        }
        return filteredFiles;
    }

    function reload() {
        webContainer?.spawn('npm', ['run', 'dev'], {
            cwd: '/my-app',
        })
    }

    return (
        <header className="h-12 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex items-center justify-between px-4">
            <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold flex items-center">
                    CodeLab
                </h1>
                <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700 mx-2" />
                <button
                    className={`flex ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} border px-3 text-sm py-1 rounded-md border-neutral-700 justify-center items-center`}
                    title="Save project"
                    onClick={async () => {
                        try {
                            setLoading(true);
                            if (!templateID) {
                                console.error('Template ID is not defined');
                                return;
                            }
                            const response = await axios.post('/api/vite', {
                                templateID,
                                Newtree: filteredFiles
                            });
                            console.log('Save response:', response.data);
                        } catch (error) {
                            console.error('Error saving project:', error);
                            alert('Failed to save project. Please try again.');
                        } finally {
                            setLoading(false);
                        }
                    }}
                >
                    <Save size={14} className="mr-1" /> Save
                </button>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={reload}
                    className="cursor-pointer"
                    title="Restart preview"
                    aria-label="Restart preview"
                >
                    <RefreshCw size={18} />
                </button>
                <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700 mx-1" />
                {/* Button to go back to the previous page */}
                <button
                    onClick={() => {
                        router.push('/main/templates');
                    }}
                    className="cursor-pointer"
                    title="Settings"
                    aria-label="Settings"
                >
                    <IconArrowLeft size={18} />
                </button>
            </div>
            {/* Loader */}
            {
                loading && (
                    <span className="fixed right-10 bottom-10 z-50 flex items-center gap-2 rounded-full px-4 py-1.5 backdrop-blur-sm bg-neutral-800/70 border border-neutral-600 shadow-xl">
                        <IconLoader
                            className="animate-spin text-primary-400"
                            size={16}
                            title="Saving..."
                        />
                        <span className="text-sm font-medium text-neutral-100 tracking-wide">
                            Saving
                        </span>
                    </span>
                )
            }
        </header>
    );
};

export default Header;