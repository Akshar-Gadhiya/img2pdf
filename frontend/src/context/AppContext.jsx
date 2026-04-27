import React, { createContext, useContext, useState } from 'react';

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

  return (
    <AppContext.Provider value={{
      files, setFiles,
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
