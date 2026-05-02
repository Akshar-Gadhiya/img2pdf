import React, { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/AppContext';

export function Upload() {
  const { files, addFiles } = useAppContext();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    
    if (droppedFiles.length > 0) {
      setIsUploading(true);
      // Give the browser time to paint the loading UI before heavy processing blocks the thread
      setTimeout(() => {
        addFiles(droppedFiles);
        setTimeout(() => {
          navigate('/preview');
        }, 1200);
      }, 100);
    }
  }, [addFiles, navigate]);

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
    
    if (selectedFiles.length > 0) {
      setIsUploading(true);
      // Give the browser time to paint the loading UI before heavy processing blocks the thread
      setTimeout(() => {
        addFiles(selectedFiles);
        setTimeout(() => {
          navigate('/preview');
        }, 1200);
      }, 100);
    }
  };

  if (isUploading) {
    return (
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-full bg-card/60 backdrop-blur-lg border border-border/50 shadow-2xl shadow-primary/20 rounded-[3rem] p-10 sm:p-16 flex flex-col items-center text-center space-y-10 animate-in zoom-in-95 duration-700 fade-in">
          
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Ambient glowing orb behind */}
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-[30px] animate-pulse"></div>
            
            {/* Spinning decorative rings */}
            <div className="absolute inset-0 rounded-full border-t-4 border-r-4 border-primary border-dashed animate-spin" style={{ animationDuration: '3s' }}></div>
            <div className="absolute inset-4 rounded-full border-b-4 border-l-4 border-primary/40 border-dotted animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
            
            {/* Center icon */}
            <div className="relative z-10 bg-background/80 p-5 rounded-3xl shadow-xl backdrop-blur-md border border-border/50">
              <Sparkles className="w-12 h-12 text-primary animate-pulse" />
            </div>
            
            {/* Floating small icons */}
            <ImageIcon className="absolute -top-4 -right-4 w-8 h-8 text-primary/60 animate-bounce" style={{ animationDelay: '0.2s' }} />
            <ImageIcon className="absolute -bottom-2 -left-6 w-10 h-10 text-primary/40 animate-bounce" style={{ animationDelay: '0.5s' }} />
          </div>

          <div className="space-y-4 max-w-md">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
              Preparing Workspace
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
              Importing and optimizing your images for the best experience...
            </p>
          </div>

          <div className="w-full max-w-md space-y-2">
            <div className="w-full h-3 bg-muted/50 rounded-full overflow-hidden border border-border/50 relative">
              <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/50 via-primary to-primary/50 w-[200%] animate-[slide_2s_linear_infinite]" style={{ transform: 'translateX(-50%)' }}></div>
            </div>
            <p className="text-sm font-semibold text-primary animate-pulse">Just a moment...</p>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 flex flex-col items-center animate-in fade-in duration-500">
      <Card className="w-full border-0 shadow-2xl rounded-3xl overflow-hidden relative min-h-[500px] flex flex-col">
        <CardHeader className="text-center pb-2 mt-4 space-y-1">
          <CardTitle className="text-3xl font-bold tracking-tight">Upload Images</CardTitle>
          <CardDescription className="text-base text-muted-foreground">Drag and drop or select files from your computer</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8 pt-6 flex-1 flex flex-col justify-center">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative group flex flex-col items-center justify-center border-[3px] border-dashed rounded-[2rem] p-8 sm:p-16 transition-all duration-300 ease-out cursor-pointer w-full min-h-[340px]
              ${isDragging 
                ? 'border-primary bg-primary/5 scale-[1.01]' 
                : 'border-muted-foreground/25 bg-muted/10 hover:border-primary/50 hover:bg-muted/30'
              }
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-6 text-center pointer-events-none">
              <div className={`p-5 rounded-2xl transition-all duration-500 ${isDragging ? 'bg-primary text-primary-foreground scale-110 shadow-lg' : 'bg-primary text-primary-foreground shadow-md group-hover:scale-110 group-hover:shadow-lg group-hover:-translate-y-1'}`}>
                <Plus className="w-12 h-12 transition-transform" strokeWidth={2.5} />
              </div>
              
              <div className="space-y-3">
                <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {isDragging ? 'Drop images here' : 'Choose files'}
                </p>
                <p className="text-base text-muted-foreground font-medium">
                  or drop images here
                </p>
              </div>
            </div>
            <Input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              multiple 
              accept="image/jpeg, image/png, image/webp"
              onChange={handleFileInput}
            />
          </div>
        </CardContent>

        {files.length > 0 && (
          <CardFooter className="bg-background border-t border-border/40 px-6 py-6 sm:py-8 flex justify-center mt-auto rounded-b-3xl">
            <Button 
              className="w-full max-w-sm h-14 rounded-2xl text-lg font-bold shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all"
              onClick={() => navigate('/preview')}
            >
              Go to Preview <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

