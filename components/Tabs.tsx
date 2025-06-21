'use client'
import { useFileSystemStore } from '@/store/fileSystemStore'
import { IconCross, IconX } from '@tabler/icons-react'
import { useMemo, useState, useEffect } from 'react'

interface FileType {
  name: string
  path: string
}

export default function Tabs() {
  const { files, activeFilePath, setActiveFile } = useFileSystemStore()
  const [activeFiles, setActiveFiles] = useState<FileType[]>([])

  // Separate the file finding logic from the activeFiles state management
  const currentFile = useMemo(() => {
    if (!activeFilePath) return null

    const parts = activeFilePath.split('/').filter(Boolean)
    let current: any = files

    for (const part of parts) {
      if (!current || current[part] === undefined) return null
      current = current[part]?.directory ?? current[part]
    }

    if (current?.file) {
      return {
        name: parts[parts.length - 1],
        path: activeFilePath,
      }
    }

    return null
  }, [files, activeFilePath])

  useEffect(() => {
    if (currentFile) {
      setActiveFiles((prev) => {
        // Check if file already exists using path comparison
        const fileExists = prev.some(file => file.path === currentFile.path)
        
        if (!fileExists) {
          const newActiveFiles = [...prev, currentFile]
          console.log('Active files:', newActiveFiles)
          return newActiveFiles
        }
        
        return prev
      })
    }
  }, [currentFile])

  const handleCloseTab = (filePathToClose: string, event: React.MouseEvent) => {
    // Prevent the tab click event from firing
    event.stopPropagation()
    
    // Determine the next active file before updating state
    let nextActiveFilePath: string | null = null
    
    if (filePathToClose === activeFilePath) {
      // Find the index of the file being closed
      const closedIndex = activeFiles.findIndex(file => file.path === filePathToClose)
      const remainingFiles = activeFiles.filter((item) => item.path !== filePathToClose)
      
      if (remainingFiles.length > 0) {
        // Try to activate the tab to the right, or the last tab if we're closing the rightmost
        const nextActiveIndex = closedIndex < remainingFiles.length ? closedIndex : remainingFiles.length - 1
        nextActiveFilePath = remainingFiles[nextActiveIndex]?.path || null
      }
    }
    
    // Update activeFiles state
    setActiveFiles((prev) => prev.filter((item) => item.path !== filePathToClose))
    
    // Update active file after state update (if needed)
    if (filePathToClose === activeFilePath) {
      setActiveFile(nextActiveFilePath)
    }
  }

  if (activeFiles.length === 0) return null

  return (
    <div className="flex items-center border bg-[#171717] gap-0.5 border-neutral-800 px-4 py-0 pt-1.5">
      {activeFiles.map((file) => (
        <div
          key={file.path} // Use path as key for better React reconciliation
          onClick={() => setActiveFile(file.path)}
          className={`flex items-center gap-1 px-3 py-0.5 text-sm font-medium rounded-t-md cursor-pointer ${
            file.path === activeFilePath 
              ? 'text-neutral-100 bg-neutral-700' 
              : 'text-neutral-400 bg-neutral-800 hover:bg-neutral-700'
          }`}
        >
          <span>{file.name}</span>
          <IconX 
            size={12} 
            className='cursor-pointer text-neutral-400 hover:text-neutral-100' 
            onClick={(e) => handleCloseTab(file.path, e)}
          />
        </div>
      ))}
    </div>
  )
}