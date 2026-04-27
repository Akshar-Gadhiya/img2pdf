import React, { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/AppContext';

export function Upload() {
  const { files, addFiles } = useAppContext();
  const [isDragging, setIsDragging] = useState(false);
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
      addFiles(droppedFiles);
      navigate('/preview');
    }
  }, [addFiles, navigate]);

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
    
    if (selectedFiles.length > 0) {
      addFiles(selectedFiles);
      navigate('/preview');
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 flex flex-col items-center">
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
