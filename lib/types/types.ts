export enum TemplateType {
    javascript = "javascript",
    python = "python",
    express = "express",
    vite = "vite"
  }
  
  export enum Privacy {
    public = "public",
    private = "private"
  }

export type FileType = 'file' | 'directory';

export interface FileSystemItem {
  id: string;
  name: string;
  type: FileType;
  content?: string;
  children?: FileSystemItem[];
  path: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  language?: string;
}

export type ThemeType = 'light' | 'dark';

export type LayoutDirection = 'horizontal' | 'vertical';

export type PanelType = 'explorer' | 'editor' | 'preview' | 'console';

export interface ConsoleMessage {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  content: string;
  timestamp: Date;
}