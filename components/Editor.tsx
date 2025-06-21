'use client'

import React, { useRef, useEffect, useState } from 'react'
import { EditorProps, Editor as MonacoEditor, useMonaco } from '@monaco-editor/react'
import { useFileSystemStore } from '../store/fileSystemStore'
import { useWebContainer } from '@/app/hooks/useContainer'

const Editor: React.FC = () => {
  const editorRef = useRef<any>(null);
  const monaco = useMonaco()
  const { webContainer } = useWebContainer();
  const [editorMounted, setEditorMounted] = useState(false);


  const { files, activeFilePath, updateFile } = useFileSystemStore()

  const languageFromFilePath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'js':
      case 'jsx':
        return 'javascript'
      case 'ts':
      case 'tsx':
        return 'typescript'
      case 'py':
        return 'python'
      case 'html':
        return 'html'
      case 'css':
        return 'css'
      case 'json':
        return 'json'
      default:
        return 'plaintext'
    }
  }

  const activeFile = (() => {
    if (!activeFilePath) return null

    const parts = activeFilePath.split('/').filter(Boolean)
    let current: any = files

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const entry = current?.[part]

      if (!entry) return null

      if ('directory' in entry) {
        current = entry.directory
      } else if ('file' in entry) {
        if (i === parts.length - 1) return entry.file
        else return null
      } else {
        return null
      }
    }

    return null
  })();

  // 🟦 Define custom theme after monaco is available
  useEffect(() => {
    if (monaco) {
      monaco.languages.register({ id: 'custom-jsx' })

      monaco.languages.setMonarchTokensProvider('custom-jsx', {
        tokenizer: {
          root: [
            [/<\/?[a-zA-Z_]\w*/, 'custom-jsx-tag'],
            [/\/?>/, 'custom-jsx-tag'],
            [/".*?"/, 'string'],
            [/[a-zA-Z_$][\w$]*/, 'identifier'],
            [/\s+/, 'white'],
            [/\/\/.*$/, 'comment'],
          ],
        },
      })

      monaco.editor.defineTheme('custom-dark', {
        base: "vs-dark",
        inherit: true,
        rules: [
          // Keywords
          { token: "keyword", foreground: "#C792EA", fontStyle: "bold" },
          { token: "keyword.control", foreground: "#C792EA", fontStyle: "bold" },
          { token: "keyword.operator", foreground: "#89DDFF" },

          { token: 'custom-jsx-tag', foreground: '#39FF14', fontStyle: 'bold' },

          { token: "string", foreground: "#C3E88D" },
          { token: "string.escape", foreground: "#EEFFFF" },

          { token: "number", foreground: "#F78C6C" },

          { token: "comment", foreground: "#546E7A", fontStyle: "italic" },
          { token: "comment.block", foreground: "#546E7A", fontStyle: "italic" },
          { token: "comment.line", foreground: "#546E7A", fontStyle: "italic" },

          // Functions
          { token: "entity.name.function", foreground: "#82AAFF", fontStyle: "bold" },
          { token: "support.function", foreground: "#82AAFF" },

          // Variables
          { token: "variable", foreground: "#EEFFFF" },
          { token: "variable.parameter", foreground: "#FFCB6B" },

          // Types
          { token: "entity.name.type", foreground: "#FFCB6B", fontStyle: "bold" },
          { token: "support.type", foreground: "#FFCB6B" },

          // Classes
          { token: "entity.name.class", foreground: "#FFCB6B", fontStyle: "bold" },
          { token: "support.class", foreground: "#FFCB6B" },

          // Constants
          { token: "constant", foreground: "#F78C6C" },
          { token: "constant.language", foreground: "#F78C6C", fontStyle: "bold" },

          { token: "punctuation", foreground: "#89DDFF" },
          { token: "punctuation.definition", foreground: "#89DDFF" },

          // Operators
          { token: "operator", foreground: "#89DDFF" },

          // Delimiters
          { token: "delimiter", foreground: "#89DDFF" },
          { token: "delimiter.bracket", foreground: "#FFCB6B" },
          { token: "delimiter.array", foreground: "#FFCB6B" },
          { token: "delimiter.parenthesis", foreground: "#89DDFF" },

          // JSON
          { token: "key", foreground: "#82AAFF" },
          { token: "value", foreground: "#C3E88D" },

          // CSS
          { token: "entity.other.attribute-name.css", foreground: "#82AAFF" },
          { token: "support.type.property-name.css", foreground: "#82AAFF" },
          { token: "constant.numeric.css", foreground: "#F78C6C" },

          // Markdown
          { token: "markup.heading", foreground: "#82AAFF", fontStyle: "bold" },
          { token: "markup.bold", foreground: "#FFCB6B", fontStyle: "bold" },
          { token: "markup.italic", foreground: "#C792EA", fontStyle: "italic" },
          { token: "markup.underline.link", foreground: "#89DDFF" },
        ],
        colors: {
          "editor.background": "#0F111A",
          "editor.foreground": "#EEFFFF",
          "editorLineNumber.foreground": "#4A5568",
          "editorLineNumber.activeForeground": "#82AAFF",
          "editor.selectionBackground": "#1F2937",
          "editor.selectionHighlightBackground": "#374151",
          "editor.lineHighlightBackground": "#1A1D29",
          "editorCursor.foreground": "#82AAFF",
          "editorWhitespace.foreground": "#2D3748",
          "editorIndentGuide.background": "#2D3748",
          "editorIndentGuide.activeBackground": "#4A5568",
          "editor.findMatchBackground": "#F78C6C40",
          "editor.findMatchHighlightBackground": "#F78C6C20",
          "editorBracketMatch.background": "#89DDFF40",
          "editorBracketMatch.border": "#89DDFF",
          "scrollbarSlider.background": "#4A556880",
          "scrollbarSlider.hoverBackground": "#4A5568",
          "scrollbarSlider.activeBackground": "#82AAFF",
          "editorSuggestWidget.background": "#1A1D29",
          "editorSuggestWidget.border": "#374151",
          "editorSuggestWidget.selectedBackground": "#374151",
          "editorHoverWidget.background": "#1A1D29",
          "editorHoverWidget.border": "#374151",
        },
      })
    }
    monaco?.editor.setTheme('custom-dark')
  }, [monaco])

  useEffect(() => {
    if (editorRef.current && activeFile) {
      const model = editorRef.current.getModel()
      const content =
        typeof activeFile.contents === 'string'
          ? activeFile.contents
          : new TextDecoder().decode(activeFile.contents)

      if (model && model.getValue() !== content) {
        model.setValue(content)
      }
    }
  }, [activeFile, editorMounted])

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor
    setEditorMounted(!editorMounted);
    editor.focus()
  }

  const handleEditorChange = async (value: string | undefined) => {
    console.log("Active file path:", activeFilePath);
    if (!activeFilePath || value === undefined) return;
    // update in zustand store
    updateFile(activeFilePath, value);
    try {
      const fullPath = `/my-app/${activeFilePath.replace(/^\//, '')}`;
      await webContainer?.fs.writeFile(fullPath, new TextEncoder().encode(value));
    } catch (err) {
      console.error(`❌ Failed to write ${activeFilePath} to WebContainer:`, err);
    }
  };

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400">
        <p className="text-center">Select a file to start editing or create a new file</p>
      </div>
    )
  }

  return (
    <div className="h-full w-full overflow-hidden rounded-md shadow border border-neutral-200 dark:border-neutral-800">
      <MonacoEditor
        width="100%"
        height="100%"
        language={languageFromFilePath(activeFilePath as string)}
        theme="custom-dark"
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          fontFamily: '"Fira Code", "JetBrains Mono", "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
          fontLigatures: true,
          fontWeight: "400",
          letterSpacing: 0.5,
          lineHeight: 1.6,

          // Line numbers and gutters
          lineNumbers: "on",
          lineNumbersMinChars: 3,
          glyphMargin: false,
          folding: true,
          foldingStrategy: "indentation",
          showFoldingControls: "mouseover",

          // Cursor and selection
          cursorBlinking: "smooth",
          cursorStyle: "line",
          cursorWidth: 2,
          cursorSmoothCaretAnimation: "on",
          selectionHighlight: true,
          occurrencesHighlight: "singleFile",

          // Scrolling and layout
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          automaticLayout: true,
          wordWrap: "on",
          wordWrapColumn: 120,
          wrappingIndent: "indent",

          // Minimap
          minimap: {
            enabled: true,
            size: "proportional",
            showSlider: "mouseover",
            renderCharacters: false,
            maxColumn: 120,
          },

          // Scrollbars
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
            arrowSize: 11,
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
          },

          // Indentation and whitespace
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: true,
          renderWhitespace: "selection",
          renderControlCharacters: false,
          // renderIndentGuides: true,
          // highlightActiveIndentGuide: true,

          // Bracket matching and highlighting
          matchBrackets: "always",
          bracketPairColorization: {
            enabled: true,
            independentColorPoolPerBracketType: true,
          },

          // Line highlighting
          renderLineHighlight: "all",
          renderLineHighlightOnlyWhenFocus: false,

          // Suggestions and IntelliSense
          quickSuggestions: {
            other: true,
            comments: false,
            strings: false,
          },
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: "on",
          acceptSuggestionOnCommitCharacter: true,
          snippetSuggestions: "top",
          wordBasedSuggestions: "matchingDocuments",
          parameterHints: {
            enabled: true,
            cycle: true,
          },

          // Context menu and interactions
          contextmenu: true,
          copyWithSyntaxHighlighting: true,
          multiCursorModifier: "ctrlCmd",
          multiCursorMergeOverlapping: true,

          // Padding and spacing
          padding: {
            top: 16,
            bottom: 16,
          },

          // Find and replace
          find: {
            addExtraSpaceOnTop: false,
            autoFindInSelection: "never",
            seedSearchStringFromSelection: "always",
          },

          // Performance
          largeFileOptimizations: true,
          stablePeek: true,

          // Accessibility
          accessibilitySupport: "auto",
          screenReaderAnnounceInlineSuggestion: true,

          // Advanced features
          codeLens: true,
          colorDecorators: true,
          linkedEditing: true,
          showUnused: true,
          unusualLineTerminators: "auto",
          stickyScroll: {
            enabled: true,
            maxLineCount: 5,
          },

          // Hover
          hover: {
            enabled: true,
            delay: 300,
            sticky: true,
          },

          // Format on type/paste
          formatOnType: true,
          formatOnPaste: true,

          // Drag and drop
          dragAndDrop: true,
          dropIntoEditor: {
            enabled: true,
          },

          // Links
          links: true,

          "semanticHighlighting.enabled": true,
        }}
      />
    </div>
  )
}

export default Editor
