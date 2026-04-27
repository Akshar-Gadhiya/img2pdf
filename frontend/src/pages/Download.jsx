import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Download, Share2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAppContext } from '@/context/AppContext';

export function DownloadPage() {
  const { files, settings, setFiles, setJobId } = useAppContext();
  const navigate = useNavigate();
  
  const [isConverting, setIsConverting] = useState(true);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  
  const hasStarted = useRef(false);

  useEffect(() => {
    if (files.length === 0) {
      navigate('/');
      return;
    }

    if (!hasStarted.current) {
      hasStarted.current = true;
      handleConvert();
    }
  }, [files, navigate]);

  const handleConvert = async () => {
    setIsConverting(true);
    setProgress(10);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 80) { clearInterval(progressInterval); return 80; }
        return prev + 10;
      });
    }, 500);
    
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('images', f.file));

      const uploadResponse = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Image upload failed');
      const { jobId } = await uploadResponse.json();
      setJobId(jobId);
      setProgress(50);
      
      const convertResponse = await fetch('http://localhost:5000/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, settings }),
      });

      if (!convertResponse.ok) throw new Error('PDF conversion failed');

      const finalUrl = `http://localhost:5000/api/download/${jobId}`;
      clearInterval(progressInterval);
      setProgress(100);
      setDownloadUrl(finalUrl);
      
      toast.success("Conversion successful!", { description: "Your PDF is ready for download." });
      
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(0);
      console.error('Error:', error);
      toast.error("Conversion failed", { description: error.message || "Failed to convert images to PDF. Please try again." });
    } finally {
      setTimeout(() => setIsConverting(false), 500);
    }
  };

  const handleShare = async () => {
    if (navigator.share && downloadUrl) {
      try {
        await navigator.share({
          title: 'My Converted PDF',
          text: 'Check out the PDF I created from my images!',
          url: downloadUrl
        });
      } catch (err) { console.log('Error sharing', err); }
    } else {
      toast.info("Sharing is not supported on this device.", { description: "You can download the PDF and share it manually." });
    }
  };

  const resetAll = () => {
    setDownloadUrl(null);
    setFiles([]);
    setProgress(0);
    navigate('/');
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center">
      <Card className="border-0 shadow-2xl rounded-3xl bg-background overflow-hidden relative w-full min-h-[400px] flex flex-col items-center justify-center p-8 sm:p-16">
        <AnimatePresence mode="wait">
          {!downloadUrl ? (
            <motion.div key="convert-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center w-full max-w-md space-y-8">
              <div className="space-y-4">
                <Loader2 className="animate-spin w-16 h-16 opacity-90 text-primary mx-auto" />
                <h2 className="text-3xl font-extrabold tracking-tight">Processing your PDF...</h2>
                <p className="text-muted-foreground text-lg">
                  Merging <span className="font-bold text-foreground">{files.length}</span> {files.length === 1 ? 'file' : 'files'} securely.
                </p>
              </div>
              
              <div className="w-full space-y-2 pt-4">
                <Progress value={progress} className="h-3 w-full bg-primary/10 rounded-full" />
                <p className="text-sm font-bold text-primary animate-pulse">{progress}% Complete</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="success-view" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center w-full max-w-lg space-y-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 12 }} className="mx-auto w-28 h-28 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner ring-[12px] ring-green-50">
                <CheckCircle className="w-14 h-14" strokeWidth={2} />
              </motion.div>
              
              <div className="space-y-3">
                <h2 className="text-4xl font-extrabold tracking-tight">Your PDF is ready!</h2>
                <p className="text-muted-foreground text-lg">Successfully packed {files.length} images into one polished document.</p>
              </div>

              <div className="pt-6 space-y-4">
                <Button size="lg" className="w-full h-16 rounded-2xl shadow-xl shadow-primary/20 text-xl font-bold transition-all hover:-translate-y-1 active:translate-y-0" asChild>
                  <a href={downloadUrl} download="converted.pdf" className="flex items-center justify-center">
                    <Download className="w-6 h-6 mr-3" strokeWidth={2.5} />
                    Download PDF
                  </a>
                </Button>
                <div className="flex gap-4 w-full pt-2">
                  <Button variant="outline" size="lg" className="flex-1 h-14 rounded-xl border-border/60 font-bold hover:bg-muted/50 transition-all" onClick={resetAll}>
                    Start Over
                  </Button>
                  <Button variant="secondary" size="lg" className="flex-1 h-14 rounded-xl font-bold shadow-sm hover:shadow-md transition-all" onClick={handleShare}>
                    <Share2 className="w-5 h-5 mr-2 opacity-80" /> Share
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
