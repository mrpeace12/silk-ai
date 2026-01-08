
import JSZip from 'jszip';

export const downloadAsFile = (content: string, filename: string, type: string = 'text/markdown') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadAsDoc = (content: string, filename: string) => {
  // Creating a simple Word-compatible HTML blob with better styling
  const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${filename}</title>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; }
        h1, h2, h3 { color: #2c3e50; margin-top: 20px; }
        .section-header { font-weight: bold; color: #4a5568; margin-top: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
      </style>
    </head>
    <body>`;
  const footer = "</body></html>";
  
  // Basic formatting preservation
  const formattedContent = content
    .replace(/\n/g, '<br>')
    .replace(/SECTION: (.*)/g, '<h2 class="section-header">$1</h2>');

  const sourceHTML = header + formattedContent + footer;
  
  const blob = new Blob(['\ufeff', sourceHTML], {
    type: 'application/msword'
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadAsZip = async (content: string, zipName: string) => {
  const zip = new JSZip();
  
  // Extract code blocks and try to identify filenames from preceding lines
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let match;
  let fileCount = 0;
  
  while ((match = codeBlockRegex.exec(content)) !== null) {
    fileCount++;
    const language = match[1] || 'txt';
    const code = match[2];
    
    // Attempt to find a filename in the line immediately preceding the block
    const textBefore = content.substring(0, match.index);
    const linesBefore = textBefore.trim().split('\n');
    const lastLineBefore = linesBefore[linesBefore.length - 1] || '';
    
    // Look for "File: path/to/file.ext" pattern
    const fileMatch = /File:\s*([a-zA-Z0-9_\-\.\/]+)/i.exec(lastLineBefore);
    
    let fileName = fileMatch ? fileMatch[1].trim() : `file_${fileCount}.${language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language === 'python' ? 'py' : language}`;
    
    // Clean up filename but preserve folders
    fileName = fileName.replace(/[<>:"|?*]/g, '');
    
    zip.file(fileName, code.trim());
  }
  
  // Include the full conversation as a documentation README
  zip.file("PROJECT_DOCUMENTATION.md", content);
  
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = zipName.endsWith('.zip') ? zipName : `${zipName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateDocTitle = (text: string) => {
  const clean = text.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 30);
  return clean.trim().replace(/\s+/g, "_") || "silk_ai_response";
};
