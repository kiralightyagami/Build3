import { cn } from "../utils/cn";

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Loader({ size = 'md', className }: LoaderProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative">
        <div className={cn("animate-spin rounded-full border-t-2 border-b-2 border-blue-500", sizeClasses[size])}></div>
        <div className={cn("absolute top-0 left-0 animate-pulse opacity-75", sizeClasses[size])}>
          <svg className="text-blue-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" strokeDasharray="60 120" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}