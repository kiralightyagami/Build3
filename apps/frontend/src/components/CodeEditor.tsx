import Editor from '@monaco-editor/react';
import { FileItem } from '../types';
import { FileCode } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CodeEditorProps {
  file: FileItem | null;
  onUpdateFile?: (updatedFile: FileItem) => void;
}

// Determine language from file extension
function getLanguage(filename: string) {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'js':
      return 'javascript';
    case 'jsx':
      return 'javascript';
    case 'ts':
      return 'typescript';
    case 'tsx':
      return 'typescript';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'scss':
      return 'scss';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    default:
      return 'plaintext';
  }
}

export function CodeEditor({ file, onUpdateFile }: CodeEditorProps) {
  const [editorContent, setEditorContent] = useState<string>(file?.content || '');

  // Update editor content when file changes
  useEffect(() => {
    if (file) {
      setEditorContent(file.content || '');
    }
  }, [file]);

  const handleEditorChange = (value: string | undefined) => {
    if (!file || !value) return;
    
    setEditorContent(value);
    
    if (onUpdateFile) {
      onUpdateFile({
        ...file,
        content: value
      });
    }
  };

  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
          <FileCode className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">No file selected</h3>
        <p className="text-gray-500 max-w-md">
          Select a file from the explorer to view and edit its contents.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <div className="absolute top-0 left-0 right-0 bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center">
        <span className="text-sm font-mono text-gray-400">{file.path}</span>
      </div>
      <div className="pt-10 h-full">
        <Editor
          height="100%"
          defaultLanguage={getLanguage(file.name)}
          theme="vs-dark"
          value={editorContent}
          onChange={handleEditorChange}
          options={{
            readOnly: false,
            minimap: { enabled: true },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            renderLineHighlight: 'all',
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            quickSuggestions: false,
            parameterHints: { enabled: false }
          }}
          onMount={(editor, monaco) => {
            // Disable validation for TypeScript/JavaScript
            if (monaco.languages.typescript) {
              monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                noSemanticValidation: true,
                noSyntaxValidation: true
              });
              
              monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                noSemanticValidation: true,
                noSyntaxValidation: true
              });
            }
          }}
        />
      </div>
    </div>
  );
}
