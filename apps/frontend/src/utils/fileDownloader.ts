import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { FileItem } from '../types';

/**
 * Creates a ZIP file from an array of FileItem objects and initiates download
 */
export async function downloadProjectAsZip(files: FileItem[], projectName: string = 'bolt-project'): Promise<void> {
  try {
    const zip = new JSZip();
    
    // Recursively add files to the zip
    const addFilesToZip = (fileItems: FileItem[], currentPath: string = '') => {
      fileItems.forEach(item => {
        // Skip files with invalid paths
        if (!item.path) return;
        
        // Remove leading slash if present
        const itemPath = item.path.startsWith('/') ? item.path.substring(1) : item.path;
        
        if (item.type === 'file' && item.content !== undefined) {
          // Add file to zip
          zip.file(itemPath, item.content || '');
        } else if (item.type === 'folder' && item.children) {
          // Process folder's children
          addFilesToZip(item.children, `${currentPath}${item.name}/`);
        }
      });
    };
    
    // Start processing files
    addFilesToZip(files);
    
    // Generate the zip file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Trigger download
    saveAs(zipBlob, `${projectName}.zip`);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error creating ZIP file:', error);
    return Promise.reject(error);
  }
} 