import { Code2, Eye } from 'lucide-react';
import { cn } from '../utils/cn';

interface TabViewProps {
  activeTab: 'code' | 'preview';
  onTabChange: (tab: 'code' | 'preview') => void;
}

export function TabView({ activeTab, onTabChange }: TabViewProps) {
  return (
    <div className="flex border border-gray-800 rounded-lg bg-gray-900 divide-x divide-gray-800 w-fit">
      <button
        onClick={() => onTabChange('code')}
        className={cn(
          "flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40",
          activeTab === 'code'
            ? 'bg-gray-800 text-white'
            : 'text-gray-400 hover:text-gray-300'
        )}
      >
        <Code2 className="w-4 h-4" />
        <span className="hidden xs:inline">Code</span>
      </button>
      <button
        onClick={() => onTabChange('preview')}
        className={cn(
          "flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40",
          activeTab === 'preview'
            ? 'bg-gray-800 text-white'
            : 'text-gray-400 hover:text-gray-300'
        )}
      >
        <Eye className="w-4 h-4" />
        <span className="hidden xs:inline">Preview</span>
      </button>
    </div>
  );
}
