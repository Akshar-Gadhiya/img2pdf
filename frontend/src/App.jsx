import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

import { Header } from '@/components/common/Header';
import { Home } from '@/pages/Home';
import { Upload } from '@/pages/Upload';
import { Preview } from '@/pages/Preview';
import { DownloadPage } from '@/pages/Download';

function App() {
  return (
    <div className="min-h-screen bg-muted/20 text-foreground antialiased selection:bg-primary/30 flex flex-col font-sans">
      <Toaster position="top-center" richColors theme="system" />
      <Header />
      
      {/* Refined Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDirection: 'reverse' }} />
      </div>

      <main className="flex-1 flex flex-col relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/download" element={<DownloadPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
