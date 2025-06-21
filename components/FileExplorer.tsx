import React, { useState, useEffect, useRef } from 'react';
import { FolderClosed, FolderOpen, ChevronRight, ChevronDown, File, FolderPlus, FilePlus, FolderPlusIcon, LucideFolderPlus } from 'lucide-react';
import { FileSystemTree } from '@webcontainer/api';
import { useFileSystemStore } from '@/store/fileSystemStore';
import { useWebContainer } from '@/app/hooks/useContainer';
import { IconTrash } from '@tabler/icons-react';


const FileExplorer = () => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const { setActiveFile, addFile, files, deleteFile } = useFileSystemStore();
  const [activeDirectory, setActiveDirectory] = useState<string>('root');
  const [type, setType] = useState<string>();
  const [inputActive, setInputActive] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { webContainer } = useWebContainer();

  const togglePath = (path: string) => {
    setExpandedPaths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) newSet.delete(path);
      else newSet.add(path);
      return newSet;
    });
  };

  useEffect(() => {
    if (inputActive) {
      inputRef.current?.focus();
    }
  }, [inputActive, type]);

  const renderTree = (node: FileSystemTree, path = '', level = 0): React.ReactNode => {
    return Object.entries(node).map(([name, entry]) => {

      const hovered = (true);
      const fullPath = path ? `${path}/${name}` : name;
      const isDir = 'directory' in entry;
      const isExpanded = expandedPaths.has(fullPath);
      const children = isDir && isExpanded ? renderTree(entry.directory, fullPath, level + 1) : null;

      return (
        <React.Fragment key={fullPath}>
          <div
            className={`flex group relative rounded my-[1px] items-center py-1 px-2 cursor-pointer ${fullPath === activeDirectory && 'bg-neutral-800'} hover:bg-neutral-100 dark:hover:bg-neutral-800`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => {
              if (isDir) {
                setActiveDirectory(fullPath);
                console.log(`Active directory set to: ${fullPath}`);
                togglePath(fullPath)
              } else {
                setActiveDirectory('root');
                console.log(`Active file set to: ${fullPath}`);
                setActiveFile(fullPath);
              };
            }}
          >
            <div className="flex items-center mr-1 text-neutral-500">
              {isDir ? (
                <>
                  <button
                    className="focus:outline-none mr-1"
                    onClick={e => {
                      e.stopPropagation();
                      togglePath(fullPath);
                    }}
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  {isExpanded ? (
                    <FolderOpen size={16} className="text-warning-500" />
                  ) : (
                    <FolderClosed size={16} className="text-warning-500" />
                  )}
                </>
              ) : (
                <File size={16} className="ml-5 text-primary-500" />
              )}
            </div>
            <span className="truncate">{name}</span>
            {/* Delete Action */}
            {
               hovered && <button
                  className="absolute rounded-md px-1 py-1 bg-red-500 cursor-pointer group-hover:opacity-100 transition-all duration-200 ease-in-out opacity-0 bottom-1 right-2 text-red-200 hover:text-red-500 hover:bg-red-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log(`Deleting file: ${fullPath}`);
                    webContainer?.spawn('rm', ['-rf', fullPath], {
                      cwd: '/my-app',
                    });
                    // Delete file from store
                    deleteFile(fullPath);
                  }}
                  title="Delete Folder"
                >
                  <IconTrash size={16} />
                </button>
            }
          </div>
          {children}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="h-full overflow-auto bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
      <div className="p-2 border-b flex justify-between items-center border-neutral-200 dark:border-neutral-800 font-medium">
        <span>Explorer</span>

        {/* File Explorer Actions */}
        <div className="flex justify-center items-center gap-0.5">
          <button
            onClick={() => {
              setType('file');
              setInputActive(true);
              setNewFileName('');
            }}

            className="p-0.5 cursor-pointer rounded transition-colors"
            title="New File"
          >
            <FilePlus size={18} />
          </button>
          <button
            onClick={() => {
              setType('folder');
              setInputActive(true);
              setNewFileName('');
            }}
            className="p-0.5 cursor-pointer mt-[2px] rounded transition-colors"
            title="New Folder"
          >
            <LucideFolderPlus size={20} />
          </button>
        </div>
      </div>
      {/* Input for adding new file/folder */}
      {
        inputActive && (
          <div
            className="flex items-center my-1 w-full gap-1">
            <input
              type="text"
              ref={inputRef}
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onBlur={() => {
                // Delay needed to check if user clicked a button to switch file/folder
                setTimeout(() => {
                  if (!document.activeElement || !inputRef.current?.contains(document.activeElement)) {
                    setInputActive(false);
                    setNewFileName('');
                  }
                }, 200);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (newFileName.trim() === '') {
                    return;
                  }

                  const fullPath = activeDirectory === 'root' ? newFileName : `${activeDirectory}/${newFileName}`;
                  // create file on webContainer
                  if (files[fullPath]) {
                    alert(`File or folder named "${newFileName}" already exists.`);
                    return;
                  }

                  if (type === 'file') {
                    webContainer?.spawn('touch', [fullPath], {
                      cwd: '/my-app',
                    });
                  } else if (type === 'folder') {
                    webContainer?.spawn('mkdir', [fullPath], {
                      cwd: '/my-app',
                    });
                  }

                  
                  if (type === 'file') {
                    addFile(activeDirectory, newFileName, 'file');
                  } else {
                    addFile(activeDirectory, newFileName, 'folder');
                  }
                  console.log(`Creating new file/folder: ${newFileName}`);
                  setInputActive(false);
                  setNewFileName('');
                }
              }}
              className="px-3 mx-1 focus:outline-0 focus:ring-0 ring-0 outline-0 py-2 w-full border border-neutral-700 rounded text-sm"
              placeholder={type === 'file' ? "New file name" : 'New folder name'}
            />
          </div>
        )
      }
      <div className="px-1">{renderTree(files)}</div>
    </div>
  );
};

export default FileExplorer;
