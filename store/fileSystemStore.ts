import { create } from 'zustand'
import { FileSystemTree } from '@webcontainer/api'

interface FileSystemState {
  files: FileSystemTree
  activeFilePath: string | null
  expandedFolders: Set<string>

  addFile: (parentPath: string, name: string, type: string, content?: string) => void
  updateFile: (path: string, content: string) => void
  deleteFile: (path: string) => void
  setActiveFile: (path: string | null) => void
  toggleFolderExpanded: (path: string) => void
}

// function setDeep(tree: FileSystemTree, pathParts: string[], value: any) {
//   const [head, ...rest] = pathParts
//   if (!head) return

//   if (rest.length === 0) {
//     tree[head] = value
//     return
//   }

//   if (!tree[head] || tree[head].kind !== 'directory') {
//     tree[head] = { kind: 'directory', directory: {} }
//   }

//   setDeep((tree[head] as any).directory, rest, value)
// }

// function deleteDeep(tree: FileSystemTree, pathParts: string[]): void {
//   const [head, ...rest] = pathParts
//   if (!tree[head]) return

//   if (rest.length === 0) {
//     delete tree[head]
//     return
//   }

//   const next = (tree[head] as any).directory
//   if (next) deleteDeep(next, rest)
// }


// function getDirAtPath(tree: FileSystemTree, pathParts: string[]): FileSystemTree {
//   return pathParts.reduce((dir, part) => {
//     if (dir?.[part]?.kind === 'directory') {
//       return (dir[part] as any).directory
//     }
//     throw new Error(`Path not found: ${pathParts.join('/')}`)
//   }, tree)
// }

export const useFileSystemStore = create<FileSystemState>((set, get) => ({
  files: {},
  activeFilePath: null,
  expandedFolders: new Set(),

  addFile: (parentPathe: string, FileName: string, type: string) => {

      const newFiles = structuredClone(get().files) as FileSystemTree
      const parentPath = parentPathe // Default to root if no parent path is provided
      const name = FileName
      const fileType = type
      const content = ''

      if (type === 'folder' && parentPath === 'root') {
        console.log('Adding folder at root:', name);
        newFiles[name] = {
          directory: {

          }
        }
        set({ files: newFiles })
        return;
      }

      if (type === 'folder') {
        // traverse the tree to find the parent directory
        const parts = parentPath.split('/').filter(Boolean);
        let currentNode = newFiles;

        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (!currentNode[part] || !('directory' in currentNode[part])) {
            currentNode[part] = { directory: {} };
          }
          currentNode = currentNode[part].directory;
        }

        currentNode[name] = {
          directory: {

          }
        }

        set({ files: newFiles })
        return;
      }

      console.log('Adding file:', { parentPath, name, fileType, content });

      if (parentPath === 'root') {
        console.log('Adding file at root:', name);
        newFiles[name] = {
          file: { contents: content }
        };
        set({ files: newFiles })
        return;
      }
      // Split the parent path into parts
      const pathParts = parentPath.split('/').filter(Boolean);
      let currentNode = newFiles;

      // Traverse the tree to find the parent directory
      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        if (!currentNode[part] || !('directory' in currentNode[part])) {
          currentNode[part] = { directory: {} };
        }
        currentNode = currentNode[part].directory;
      }
      // Add the new file
      currentNode[name] = {
        file: { contents: content }
      };
      set({ files: newFiles });
      return 
  },

  updateFile: (path: string, newContent: string) => {
    console.log('Path for updation', path);
    // DeepClone the file system tree
    const newFiles = structuredClone(get().files) as FileSystemTree
    // Split the path into parts
    const pathParts = path.split('/').filter(Boolean);
    // traverse the tree and update the file
    let currentNode = newFiles;

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      const node = currentNode[part];

      if (!node) throw new Error(`Path not found: ${part}`);

      if (i === pathParts.length - 1) {
        // last part, expect file node
        if ('file' in node && 'contents' in node.file) {
          // update contents here
            node.file.contents = newContent;
        } else {
          throw new Error(`Expected file at ${part}, but got directory or symlink`);
        }
      } else {
        if ('directory' in node) {
          currentNode = node.directory;
        } else {
          throw new Error(`Expected directory at ${part}, but got file or symlink`);
        }
      }
    }
    set({ files: newFiles })
  },

  deleteFile: (path: string) => {
    console.log('Path for deletion', path);
    const newFiles = structuredClone(get().files) as FileSystemTree
    const pathParts = path.split('/').filter(Boolean);
    
    let currentNode = newFiles; 

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      if (!currentNode[part]) {
        console.warn(`Path not found: ${path}`);
        return;
      }

      if (i === pathParts.length - 1) {
        // last part, delete the file or directory
        delete currentNode[part];
      } else {
        // traverse deeper into the directory
        if ('directory' in currentNode[part]) {
          currentNode = currentNode[part].directory;
        } else {
          console.warn(`Expected directory at ${part}, but got file`);
          return;
        }
      }
    }
    
    set({ files: newFiles })
  },

  setActiveFile: (path) => {
    set({ activeFilePath: path })
  },

  toggleFolderExpanded: (path) => {
    set((state) => {
      const newExpanded = new Set(state.expandedFolders)
      newExpanded.has(path) ? newExpanded.delete(path) : newExpanded.add(path)
      return { expandedFolders: newExpanded }
    })
  },
}))
