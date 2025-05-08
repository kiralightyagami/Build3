import { WebContainer } from '@webcontainer/api';
import { useEffect, useState } from 'react';
import { cn } from '../utils/cn';
import { RefreshCw, AlertOctagon } from 'lucide-react';
import { FileItem } from '../types';

interface PreviewFrameProps {
  files: FileItem[];
  webContainer: WebContainer;
  onError?: (error: string | null) => void;
}

export function PreviewFrame({ files, webContainer, onError }: PreviewFrameProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  async function startDevServer() {
    try {
      setLoading(true);
      setError(null);
      
      // Install dependencies
      const installProcess = await webContainer.spawn('npm', ['install']);
      
      // Stream the install output to console
      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log(`[npm install]: ${data}`);
          },
        })
      );

      // Wait for install to complete
      const installExitCode = await installProcess.exit;
      
      if (installExitCode !== 0) {
        const errorMessage = `npm install failed with exit code ${installExitCode}`;
        setError(errorMessage);
        onError?.(errorMessage);
        setLoading(false);
        return;
      }
      
      // Start the dev server
      try {
        const devProcess = await webContainer.spawn('npm', ['run', 'dev', '--', '--host']);
        
        devProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              console.log(`[npm run dev]: ${data}`);
            },
          })
        );
      } catch (err) {
        console.error('Failed to start dev server:', err);
        const errorMessage = 'Failed to start development server';
        setError(errorMessage);
        onError?.(errorMessage);
        setLoading(false);
        return;
      }

      // Listen for server-ready event
      webContainer.on('server-ready', (port, serverUrl) => {
        console.log(`Server ready at ${serverUrl} (port ${port})`);
        setUrl(serverUrl);
        setLoading(false);
        onError?.(null);
      });
    } catch (err) {
      console.error('Preview initialization error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage.includes('SharedArrayBuffer') || errorMessage.includes('crossOriginIsolated')) {
        const message = 'This browser requires cross-origin isolation for the preview. Try restarting the dev server with "npm run dev" or try another browser.';
        setError(message);
        onError?.(message);
      } else {
        const message = `Failed to initialize preview environment: ${errorMessage}`;
        setError(message);
        onError?.(message);
      }
      
      setLoading(false);
    }
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    startDevServer();
  };

  useEffect(() => {
    if (files.length > 0 && webContainer) {
      startDevServer();
    }
  }, [files, webContainer, retryCount]);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-950 rounded-lg overflow-hidden border border-gray-800">
      {loading && (
        <div className="text-center p-6 flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-300 font-medium">Setting up preview environment...</p>
          <p className="text-sm text-gray-500">This might take a moment</p>
        </div>
      )}
      
      {error && (
        <div className="text-center p-6 bg-red-950/20 rounded-lg border border-red-900/50 max-w-md">
          <AlertOctagon className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-red-400 font-medium text-lg mb-2">Preview Error</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-gray-200 rounded-md transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      )}
      
      {url && !loading && !error && (
        <iframe 
          src={url} 
          className={cn(
            "w-full h-full border-0 transition-opacity duration-300",
            loading ? "opacity-0" : "opacity-100"
          )}
          title="Site Preview"
          sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
          allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb; xr-spatial-tracking"
        />
      )}
    </div>
  );
}
