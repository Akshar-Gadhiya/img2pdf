import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import imageCompression from 'browser-image-compression';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [files, setFiles] = useState([]);
  const [jobId, setJobId] = useState(null);
  const [settings, setSettings] = useState({
    pageSize: "a4",
    orientation: "portrait",
    margin: 10,
    imageFit: "fill"
  });

  const processingQueue = useRef([]);
  const isProcessingRef = useRef(false);

  const processNextBatch = useCallback(async () => {
    if (isProcessingRef.current || processingQueue.current.length === 0) return;
    
    isProcessingRef.current = true;
    const batchSize = 5;
    const batch = processingQueue.current.splice(0, batchSize);

    const processedBatch = await Promise.all(batch.map(async (item) => {
      try {
        const compressedFile = await imageCompression(item.originalFile, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
        
        const thumbFile = await imageCompression(item.originalFile, {
          maxSizeMB: 0.05,
          maxWidthOrHeight: 400,
          useWebWorker: true,
        });

        return {
          id: item.id,
          file: compressedFile,
          preview: URL.createObjectURL(thumbFile),
          status: 'done'
        };
      } catch (e) {
        console.error("Compression error:", e);
        return { id: item.id, status: 'error' };
      }
    }));

    setFiles(prev => prev.map(f => {
      const processed = processedBatch.find(p => p.id === f.id);
      return processed ? { ...f, ...processed } : f;
    }));

    isProcessingRef.current = false;
    
    if (processingQueue.current.length > 0) {
      setTimeout(() => processNextBatch(), 50); // Yield to event loop
    }
  }, []);

  const addFiles = useCallback((newFiles) => {
    const fileObjects = newFiles.map(file => {
      const id = Math.random().toString(36).substring(7);
      return {
        id,
        originalFile: file,
        file: null,
        preview: null,
        rotation: 0,
        status: 'pending'
      };
    });

    setFiles(prev => [...prev, ...fileObjects]);
    
    processingQueue.current.push(...fileObjects);
    processNextBatch();
  }, [processNextBatch]);

  return (
    <AppContext.Provider value={{
      files, setFiles,
      addFiles,
      jobId, setJobId,
      settings, setSettings
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
