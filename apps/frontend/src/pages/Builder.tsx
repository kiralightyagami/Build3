import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepsList } from '../components/StepsList.tsx';
import { FileExplorer } from '../components/FileExplorer';
import { TabView } from '../components/TabView.tsx';
import { CodeEditor } from '../components/CodeEditor.tsx';
import { PreviewFrame } from '../components/PreviewFrame';
import { Step, FileItem, StepType } from '../types/index.ts';
import axios from 'axios';
import { API_URL } from '../config.ts';
import { parseXml } from '../steps';
import { useWebContainer } from '../hooks/useWebContainer';
import { Loader } from '../components/Loader.tsx';

import {
  Home,
  PanelRight,
  Send,
  RefreshCw,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { WebContainer } from '@webcontainer/api';
import { downloadProjectAsZip } from '../utils/fileDownloader';
import { useAppContext } from '../context/AppContext';

// Defining the step status type explicitly
type StepStatus = 'pending' | 'in-progress' | 'completed';

export function Builder() {
  const navigate = useNavigate();
  const {
    prompt,
    setLoading: setContextLoading,
    currentStep,
    setCurrentStep,
  } = useAppContext();
  const [userPrompt, setPrompt] = useState('');
  const [llmMessages, setLlmMessages] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const {
    webcontainer,
    error: webContainerError,
    loading: webContainerLoading,
  } = useWebContainer();

  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFileExplorerCollapsed, setFileExplorerCollapsed] = useState(false);

  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Process steps to generate files
  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;

    steps
      .filter(({ status }) => status === 'pending')
      .forEach((step) => {
        updateHappened = true;
        if (step?.type === StepType.CreateFile) {
          let parsedPath = step.path?.split('/') ?? []; // ["src", "components", "App.tsx"]
          let currentFileStructure = [...originalFiles]; // {}
          let finalAnswerRef = currentFileStructure;

          let currentFolder = '';
          while (parsedPath.length) {
            currentFolder = `${currentFolder}/${parsedPath[0]}`;
            let currentFolderName = parsedPath[0];
            parsedPath = parsedPath.slice(1);

            if (!parsedPath.length) {
              // final file
              let file = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!file) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: 'file',
                  path: currentFolder,
                  content: step.code,
                });
              } else {
                file.content = step.code;
              }
            } else {
              /// in a folder
              let folder = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!folder) {
                // create the folder
                currentFileStructure.push({
                  name: currentFolderName,
                  type: 'folder',
                  path: currentFolder,
                  children: [],
                });
              }

              currentFileStructure = currentFileStructure.find(
                (x) => x.path === currentFolder
              )!.children!;
            }
          }
          originalFiles = finalAnswerRef;
        }
      });

    if (updateHappened) {
      setFiles(originalFiles);
      setSteps((steps) =>
        steps.map((s: Step) => {
          return {
            ...s,
            status: 'completed' as StepStatus,
          };
        })
      );
    }
  }, [steps]);

  // Update WebContainer when files change
  useEffect(() => {
    if (!webcontainer || files.length === 0) return;

    try {
      (webcontainer as WebContainer).mount(createMountStructure(files));
    } catch (err) {
      console.error('Error mounting files to WebContainer:', err);
    }
  }, [files, webcontainer]);

  const handleFileUpdate = (updatedFile: FileItem) => {
    // Deep clone files to maintain immutability
    const updateFilesRecursively = (
      filesArray: FileItem[],
      fileToUpdate: FileItem
    ): FileItem[] => {
      return filesArray.map((file) => {
        if (file.path === fileToUpdate.path) {
          return fileToUpdate;
        } else if (file.type === 'folder' && file.children) {
          return {
            ...file,
            children: updateFilesRecursively(file.children, fileToUpdate),
          };
        }
        return file;
      });
    };

    const updatedFiles = updateFilesRecursively(files, updatedFile);
    setFiles(updatedFiles);

    // Update file in WebContainer if it's initialized
    if (webcontainer) {
      try {
        (webcontainer as WebContainer).fs.writeFile(
          updatedFile.path.startsWith('/')
            ? updatedFile.path.substring(1)
            : updatedFile.path,
          updatedFile.content || ''
        );
      } catch (err) {
        console.error('Error writing file to WebContainer:', err);
      }
    }
  };

  // Create mount structure for WebContainer
  const createMountStructure = (files: FileItem[]): Record<string, any> => {
    const mountStructure: Record<string, any> = {};

    const processFile = (file: FileItem, isRootFolder: boolean) => {
      if (file.type === 'folder') {
        // For folders, create a directory entry
        mountStructure[file.name] = {
          directory: file.children
            ? Object.fromEntries(
                file.children.map((child) => [
                  child.name,
                  processFile(child, false),
                ])
              )
            : {},
        };
      } else if (file.type === 'file') {
        if (isRootFolder) {
          mountStructure[file.name] = {
            file: {
              contents: file.content || '',
            },
          };
        } else {
          // For files, create a file entry with contents
          return {
            file: {
              contents: file.content || '',
            },
          };
        }
      }

      return mountStructure[file.name];
    };

    // Process each top-level file/folder
    files.forEach((file) => processFile(file, true));

    return mountStructure;
  };

  async function init() {
    try {
      setLoading(true);

      // Skip if template is already set
      if (!templateSet) {
        // Get template from backend
        const response = await axios.post(`${API_URL}/api/v1/gemini/template`, {
          prompt,
        });

        const { prompts, uiPrompts } = response.data;

        setLlmMessages([
          {
            role: 'user',
            content: prompt, // Store content for UI display
          },
        ]);

        // Set the initial steps from template
        const initialSteps = parseXml(uiPrompts[0] || '').map((x: any) => ({
          ...x,
          status: 'pending' as StepStatus,
        }));

        setSteps(initialSteps);
        setTemplateSet(true);

        // Format messages for generate endpoint
        const formattedMessages = [...prompts, prompt].map((content: string) => ({
          role: 'user',
          parts: [{ text: content }]
        }));

        // Send the chat request for full project generation
        const chatResponse = await axios.post(`${API_URL}/api/v1/gemini/generate`, {
          messages: formattedMessages
        });

        // Process the steps from the chat response
        const newSteps = parseXml(chatResponse.data.response).map((x: any) => ({
          ...x,
          status: 'pending' as StepStatus,
        }));

        setSteps((prevSteps) => [...prevSteps, ...newSteps]);

        setLlmMessages((prevMessages) => [
          ...prevMessages,
          { role: 'user', content: chatResponse.data.response },
        ]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error initializing project:', error);
      setLoading(false);
    }
  }

  const handleRefreshWebContainer = () => {
    window.location.href = '/';
  };

  const handleDownloadProject = async () => {
    if (files.length > 0) {
      setIsDownloading(true);
      try {
        await downloadProjectAsZip(files);
      } catch (error) {
        console.error('Failed to download project:', error);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!userPrompt.trim()) return;

    // Format the new user message according to schema
    const newUserMessage = {
      role: 'user' as const,
      content: userPrompt // Keep content for UI display
    };

    // Update UI immediately
    setLlmMessages([...llmMessages, newUserMessage]);
    setPrompt('');
    setLoading(true);

    try {
      // Create properly formatted messages for API
      const formattedMessages = [
        ...llmMessages.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        })),
        {
          role: 'user' as const, 
          parts: [{ text: userPrompt }]
        }
      ];

      const response = await axios.post(`${API_URL}/api/v1/gemini/generate`, {
        messages: formattedMessages
      });

      const assistantMessage = {
        role: 'user' as const,
        content: response.data.response
      };

      setLlmMessages(prevMessages => [...prevMessages, assistantMessage]);

      // Check if the response contains steps in XML format
      const newSteps = parseXml(response.data.response).map((x: any) => ({
        ...x,
        status: 'pending' as StepStatus,
      }));

      if (newSteps.length > 0) {
        setSteps((prevSteps) => [...prevSteps, ...newSteps]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add retry function
  const handleRetryPreview = async () => {
    setIsRetrying(true);
    setPreviewError(null);
    try {
      if (webcontainer) {
        // Reinstall dependencies
        const installProcess = await (webcontainer as WebContainer).spawn('npm', ['install']);
        const installExitCode = await installProcess.exit;
        
        if (installExitCode !== 0) {
          throw new Error('npm install failed');
        }

        // Start the dev server
        const devProcess = await (webcontainer as WebContainer).spawn('npm', ['run', 'dev']);
        const devExitCode = await devProcess.exit;
        
        if (devExitCode !== 0) {
          throw new Error('Failed to start dev server');
        }
      }
    } catch (error) {
      console.error('Preview retry error:', error);
      setPreviewError(error instanceof Error ? error.message : 'Failed to start preview');
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    if (webcontainer && !templateSet) {
      init();
    }
  }, [webcontainer, templateSet]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 animate-gradient" />
      
      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-indigo-900/20 to-purple-900/20 animate-gradient-slow" />
      
      {/* Animated orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-900/30 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-900/30 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-900/30 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-800/30 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-6000" />
      </div>

      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Main content */}
      <div className="relative z-10">
        <div className="flex h-screen">
          {/* Left sidebar */}
          <div
            className={`flex flex-col border-r border-gray-800 bg-gray-900/50 backdrop-blur-sm ${
              isSidebarCollapsed ? 'w-16' : 'w-80'
            } transition-all duration-300 ease-in-out`}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Home size={20} />
              </button>
              <button
                onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <PanelRight
                  size={20}
                  className={`transform transition-transform ${
                    isSidebarCollapsed ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {/* Current Prompt */}
            {!isSidebarCollapsed && (
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Current Prompt</h3>
                <p className="text-sm text-gray-300 line-clamp-3">{prompt}</p>
              </div>
            )}

            {/* Steps List with Scroll */}
            <div className="flex-1 overflow-y-auto">
              <StepsList
                steps={steps}
                currentStep={currentStep}
                onStepClick={setCurrentStep}
              />
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* File explorer */}
            <div
              className={`border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm ${
                isFileExplorerCollapsed ? 'h-12' : 'h-48'
              } transition-all duration-300 ease-in-out flex-shrink-0`}
            >
              <div className="flex items-center justify-between p-2 border-b border-gray-800">
                <span className="text-sm font-medium text-gray-400">Files</span>
                <button
                  onClick={() => setFileExplorerCollapsed(!isFileExplorerCollapsed)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <PanelRight
                    size={16}
                    className={`transform transition-transform ${
                      isFileExplorerCollapsed ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>
              {!isFileExplorerCollapsed && (
                <div className="h-[calc(100%-2.5rem)] overflow-y-auto">
                  <FileExplorer
                    files={files}
                    onFileSelect={setSelectedFile}
                  />
                </div>
              )}
            </div>

            {/* Code editor and preview */}
            <div className="flex-1 flex min-h-0">
              <div className="flex-1 flex flex-col min-h-0">
                <TabView
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
                <div className="flex-1 min-h-0 relative">
                  {activeTab === 'code' ? (
                    <CodeEditor
                      file={selectedFile}
                      onUpdateFile={handleFileUpdate}
                    />
                  ) : (
                    <div className="absolute inset-0">
                      {previewError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-sm z-10">
                          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                          <p className="text-red-500 mb-4">{previewError}</p>
                          <button
                            onClick={handleRetryPreview}
                            disabled={isRetrying}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isRetrying ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Retrying...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4" />
                                Retry
                              </>
                            )}
                          </button>
                        </div>
                      )}
                      <PreviewFrame
                        files={files}
                        webContainer={webcontainer as WebContainer}
                        onError={setPreviewError}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chat input */}
            <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm p-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userPrompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-800/50 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={loading}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
