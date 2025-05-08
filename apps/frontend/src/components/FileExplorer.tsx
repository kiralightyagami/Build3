import { useState } from 'react';
import { FolderTree, File, ChevronRight, ChevronDown, FileCode, FileJson, FileText } from 'lucide-react';
import { FileItem } from '../types';
import { cn } from '../utils/cn';

interface FileExplorerProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
}

interface FileNodeProps {
  item: FileItem;
  depth: number;
  onFileClick: (file: FileItem) => void;
}

function getFileIcon(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return <FileCode className="w-4 h-4 text-yellow-500" />;
    case 'json':
      return <FileJson className="w-4 h-4 text-green-500" />;
    case 'md':
      return <FileText className="w-4 h-4 text-blue-400" />;
    case 'html':
      return <FileCode className="w-4 h-4 text-orange-500" />;
    case 'css':
    case 'scss':
      return <FileCode className="w-4 h-4 text-purple-500" />;
    default:
      return <File className="w-4 h-4 text-gray-400" />;
  }
}

function FileNode({ item, depth, onFileClick }: FileNodeProps) {
  const [isExpanded, setIsExpanded] = useState(item.type === 'folder');

  const handleClick = () => {
    if (item.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick(item);
    }
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer transition-colors text-sm",
          item.type === 'file' ? "hover:bg-gray-800/70" : "hover:bg-gray-800/40",
        )}
        style={{ paddingLeft: `${depth * 0.75 + 0.5}rem` }}
        onClick={handleClick}
      >
        {item.type === 'folder' && (
          <span className="text-gray-500">
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </span>
        )}
        {item.type === 'folder' ? (
          <FolderTree className="w-4 h-4 text-blue-400" />
        ) : (
          getFileIcon(item.name)
        )}
        <span className={cn("truncate", item.type === 'folder' ? "text-gray-300 font-medium" : "text-gray-400")}>
          {item.name}
        </span>
      </div>
      {item.type === 'folder' && isExpanded && item.children && (
        <div className="animate-fadeIn">
          {item.children
            .sort((a, b) => {
              // Folders first, then files
              if (a.type === 'folder' && b.type === 'file') return -1;
              if (a.type === 'file' && b.type === 'folder') return 1;
              // Alphabetical order
              return a.name.localeCompare(b.name);
            })
            .map((child, index) => (
              <FileNode
                key={`${child.path}-${index}`}
                item={child}
                depth={depth + 1}
                onFileClick={onFileClick}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer({ files, onFileSelect }: FileExplorerProps) {
  const sortedFiles = [...files].sort((a, b) => {
    // Folders first, then files
    if (a.type === 'folder' && b.type === 'file') return -1;
    if (a.type === 'file' && b.type === 'folder') return 1;
    // Alphabetical order
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="h-full overflow-auto py-2">
      <div className="space-y-0.5">
        {sortedFiles.map((file, index) => (
          <FileNode
            key={`${file.path}-${index}`}
            item={file}
            depth={0}
            onFileClick={onFileSelect}
          />
        ))}
        {sortedFiles.length === 0 && (
          <div className="p-4 text-center text-gray-500 text-sm">
            No files available
          </div>
        )}
      </div>
    </div>
  );
}