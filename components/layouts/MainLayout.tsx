'use client'
import React, { useEffect, useState } from 'react';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle
} from 'react-resizable-panels';
import Header from '../Header';
import FileExplorer from '../FileExplorer';
import Editor from '../Editor';
import Tabs from '../Tabs';
import Console from '../Console';
import { useFileSystemStore } from '../../store/fileSystemStore';
import { useWebContainer } from '@/app/hooks/useContainer';
import type { FileSystemAPI, FileSystemTree } from '@webcontainer/api';
import axios from 'axios';
import { useParams } from 'next/navigation';
import ShimmerText from '../ShimmerText';

const MainLayout: React.FC = () => {

  const { webContainer, isLoading, error } = useWebContainer();
  const params = useParams();
  const templateId = params.templateId as string;
  const { setActiveFile } = useFileSystemStore();
  const [processUrl, setProcessUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState<string>("Initializing workspace");

  async function readDirectoryToFileSystemTree(fs: FileSystemAPI, path: string): Promise<FileSystemTree> {
    const tree: FileSystemTree = {};
    const entries = await fs.readdir(path, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = `${path}/${entry.name}`;

      if (entry.isFile()) {
        let content = await fs.readFile(fullPath, 'utf8');
        // Sanitize null characters (which Postgres can't handle)
        if (content.includes('\u0000')) {
          console.log('fileName', entry.name);
          console.warn(`⚠️ Null character found in ${fullPath}, sanitizing`);
          content = content.replace(/\u0000/g, '');
        }

        tree[entry.name] = {
          file: { contents: content }
        };
      }

      if (entry.isDirectory()) {
        const subTree = await readDirectoryToFileSystemTree(fs, fullPath);
        tree[entry.name] = {
          directory: subTree
        };
      }
    }

    return tree;
  }

  // Initialize WebContainer
  useEffect(() => {
    const setupViteProject = async () => {
      setLoading(true);
      console.log('Setting up Vite project...');

      if (!webContainer || isLoading || error) return;

      const res = await axios.get(`/api/vite?templateID=${templateId}`);

      if (res.data.template.fileSystemTree) {
        console.log('Using existing template file system tree:', res.data.template.fileSystemTree);

        // check if /my-app directory exists
        try {
          await webContainer.fs.readdir('/my-app');
          console.log('Directory /my-app already exists, Removing it');
          await webContainer.fs.rm('/my-app', { recursive: true });
        } catch (e) {
          console.log('Directory /my-app does not exist, proceeding with setup.');
        }

        await webContainer.fs.mkdir('/my-app');

        await webContainer.mount(res.data.template.fileSystemTree, {
          mountPoint: '/my-app'
        });

        const installDeps = await webContainer.spawn('npm', ['install'], {
          cwd: '/my-app'
        });
        await installDeps.exit;

        const appPathExists = await webContainer.fs
          .readdir('/my-app')
          .then(() => true)
          .catch(() => false);

        if (!appPathExists) {
          console.error('❌ /my-app directory does not exist after mount!');
          setLoading(false);
          return;
        }

        const tree = await readDirectoryToFileSystemTree(webContainer.fs, '/my-app');

        await webContainer.spawn('npm', ['run', 'dev'], {
          cwd: '/my-app',
        });

        webContainer.on('server-ready', (_, url) => {
          console.log(`Vite server is running at ${url}`);
          setProcessUrl(url);
        });

        useFileSystemStore.setState({
          files: tree,
          activeFilePath: '',
          expandedFolders: new Set(['src'])
        });

        setLoading(false);
        return;
      }


      try {

        // Clean up any existing my-app directory
        try {
          await webContainer.fs.rm('/my-app', { recursive: true }); 
        } catch (e) {
          console.log('No existing /my-app directory found, proceeding with setup.');
        }

        console.log('Creating new Vite project..........................');
        // Step 1: Create Vite project
        try {
          setLoadingText('Creating Vite project');
          const init = await webContainer.spawn('npx', [
            '--yes',
            'create-vite@latest',
            'my-app',
            '--template',
            'react'
          ]);
          init.output.pipeTo(
            new WritableStream({
              write(chunk) {
                console.log(chunk);
              },
            })
          );

          await init.exit;
        } catch (error) {
          console.error('Error creating Vite project:', error);
        }


        console.log('Vite project created successfully.');

        // Step 2: Install dependencies
        setLoadingText('Installing dependencies');
        const install = await webContainer.spawn('npm', ['install'], {
          cwd: '/my-app'
        });

        console.log('Installing dependencies...');
        install.output.pipeTo(
          new WritableStream({
            write(chunk) {
              console.log(chunk);
            },
          })
        );

        await install.exit;

        console.log('Dependencies installed successfully.');
        const tree = await readDirectoryToFileSystemTree(webContainer.fs, '/my-app');
        console.log('File system tree:', JSON.stringify(tree, null, 2));

        // Update Zustand store with the file system tree
        useFileSystemStore.setState({
          files: tree,
          activeFilePath: '',
          expandedFolders: new Set(['src'])
        });

        // Step 3: Start Vite development server
        setLoadingText('Starting Vite development server');
        await webContainer.spawn('npm', ['run', 'dev'], {
          cwd: '/my-app',
        });


        webContainer.on('server-ready', (_, url) => {
          console.log(`Vite server is running at ${url}`);
          setProcessUrl(url);
          setLoading(false);
        })

      } catch (err) {
        console.error('❌ Failed to initialize Vite project:', err);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    setupViteProject();

  }, [webContainer, isLoading, error]);

  return (
    <div className="h-full w-screen overflow-hidden flex flex-col ">
      <Header />
      <div className="flex h-full overflow-hidden">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={15} minSize={10}>
            <FileExplorer />
          </Panel>
          <PanelResizeHandle className="resize-handle-horizontal" />
          <Panel>
            <div className="h-full flex flex-col">
              <Tabs />
              <div className="h-full justify-center items-center flex overflow-hidden">
                {/* <Panel> */}
                <div className='w-full h-full flex'>
                  <PanelGroup direction="horizontal">
                    <Panel>
                      <Editor />
                    </Panel>
                    <PanelResizeHandle className="resize-handle-horizontal" />
                    <Panel>
                      <div className='w-full h-full bg-slate-300'>
                        {(processUrl !== "") && <iframe src={processUrl} style={{ width: '100%', height: '100%' }} />}
                      </div>
                    </Panel>
                  </PanelGroup>
                </div>
              </div>
              <Console />
            </div>
          </Panel>
        </PanelGroup>
      </div>
      {/* Loader */}
      {loading && (
        <div
          style={{
            backdropFilter: "blur(100px)",
            WebkitBackdropFilter: "blur(100px)",
          }}
          className="w-full absolute top-0 left-0 h-[100vh] flex flex-col justify-center items-center bg-neutral-900 opacity-90 z-[1000]"
        >
          {/* Modern Loading Animation */}
          <div className="relative flex flex-col items-center">
            {/* Main Spinner Container */}
            <div className="relative w-32 h-32 mb-2">
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-neutral-700">
                <div
                  className="absolute inset-0 rounded-full border-t-2 border-white animate-spin"
                  style={{ animationDuration: "2s" }}
                ></div>
              </div>

              {/* Middle Ring */}
              <div className="absolute inset-4 rounded-full border border-neutral-600">
                <div
                  className="absolute inset-0 rounded-full border-t border-neutral-300 animate-spin"
                  style={{ animationDirection: "reverse", animationDuration: "3s" }}
                ></div>
              </div>

              {/* Inner Pulsing Core */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-full animate-pulse opacity-80"></div>
                <div
                  className="absolute w-4 h-4 bg-neutral-900 rounded-full animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                ></div>
              </div>
            </div>
          </div>
          <div>
            <ShimmerText text={loadingText} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;