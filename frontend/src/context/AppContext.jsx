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
  const hqQueue = useRef([]);
  const isProcessingRef = useRef(false);
  const isHqProcessingRef = useRef(false);

  const processHqQueue = useCallback(async () => {
    if (isHqProcessingRef.current || hqQueue.current.length === 0) return;
    isHqProcessingRef.current = true;
    
    // Process 2 at a time for HQ to keep memory safe
    const batchSize = 2;
    const batch = hqQueue.current.splice(0, batchSize);

    const promises = batch.map(async (item) => {
      try {
        const compressedFile = await imageCompression(item.originalFile, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });

        setFiles(prev => prev.map(f => 
          f.id === item.id ? { ...f, file: compressedFile, status: 'done' } : f
        ));
      } catch (e) {
        console.error("HQ Compression error:", e);
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error' } : f));
      }
    });

    await Promise.all(promises);
    isHqProcessingRef.current = false;
    
    if (hqQueue.current.length > 0) {
      setTimeout(() => processHqQueue(), 10);
    }
  }, []);

  const processThumbQueue = useCallback(async () => {
    if (isProcessingRef.current || processingQueue.current.length === 0) return;
    isProcessingRef.current = true;
    
    // Process thumbnails very quickly (4 at a time)
    const batchSize = 4;
    const batch = processingQueue.current.splice(0, batchSize);

    const promises = batch.map(async (item) => {
      try {
        const thumbFile = await imageCompression(item.originalFile, {
          maxSizeMB: 0.02,
          maxWidthOrHeight: 400,
          useWebWorker: true,
        });
        
        const previewUrl = URL.createObjectURL(thumbFile);
        
        setFiles(prev => prev.map(f => 
          f.id === item.id ? { ...f, preview: previewUrl, status: 'processing_hq' } : f
        ));
        
        // Push to HQ queue after thumbnail is ready
        hqQueue.current.push(item);

      } catch (e) {
        console.error("Thumb error:", e);
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error' } : f));
      }
    });

    await Promise.all(promises);
    isProcessingRef.current = false;
    
    // Trigger HQ queue in the background
    if (!isHqProcessingRef.current) {
      setTimeout(() => processHqQueue(), 10);
    }
    
    if (processingQueue.current.length > 0) {
      setTimeout(() => processThumbQueue(), 10);
    }
  }, [processHqQueue]);

  const addFiles = useCallback((newFiles) => {
    const fileObjects = newFiles.map((file) => {
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
    processThumbQueue();
  }, [processThumbQueue]);

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
