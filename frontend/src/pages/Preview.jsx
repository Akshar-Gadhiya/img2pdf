import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { AnimatePresence } from 'framer-motion';
import { Trash2, ArrowRight, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';

import { useAppContext } from '@/context/AppContext';
import { SortableImageCard } from '@/components/preview/SortableImageCard';

export function Preview() {
  const { files, setFiles, settings, setSettings, addFiles } = useAppContext();
  const navigate = useNavigate();
  const isProcessing = files.some(f => f.status === 'pending' || f.status === 'processing_hq');
  const fileInputRef = useRef(null);

  const handleAddMore = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
    if (selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFiles((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const removeFile = (id) => {
    setFiles(prev => {
      const toRemove = prev.find(f => f.id === id);
      if (toRemove && toRemove.preview) {
        try { URL.revokeObjectURL(toRemove.preview); } catch (e) { /* ignore */ }
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const rotateFile = (id) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, rotation: (f.rotation + 90) % 360 } : f));
  };

  if (files.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl font-semibold text-muted-foreground">No images uploaded yet.</p>
          <Button onClick={() => navigate('/upload')}>Go to Upload</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      {/* Left Column: Image Arranging */}
      <div className="flex-1 min-w-0">
        <Card className="border-0 shadow-2xl rounded-3xl bg-background overflow-hidden relative w-full flex flex-col h-full">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                Arranging {files.length} {files.length === 1 ? 'file' : 'files'}
              </CardTitle>
              <CardDescription>Drag and drop to reorder images.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => fileInputRef.current?.click()} className="text-muted-foreground hover:text-primary hover:bg-primary/10 font-bold transition-colors">
                <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} />
                Add More
              </Button>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                multiple 
                accept="image/jpeg, image/png, image/webp"
                onChange={handleAddMore}
              />
              <Button variant="ghost" onClick={() => {
                // Revoke all preview URLs before clearing
                files.forEach(f => { if (f.preview) { try { URL.revokeObjectURL(f.preview); } catch (e) { /* ignore */ } } });
                setFiles([]);
              }} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 font-bold transition-colors">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-6 pb-8 flex-1">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={files.map(f => f.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {files.map((file) => (
                      <SortableImageCard key={file.id} fileObj={file} onRemove={removeFile} onRotate={rotateFile} />
                    ))}
                  </AnimatePresence>
                </div>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: PDF Settings & CTA */}
      <div className="w-full lg:w-[400px] flex flex-col gap-6 shrink-0">
        <Card className="border-0 shadow-2xl rounded-3xl bg-background overflow-hidden flex flex-col">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">PDF Settings</CardTitle>
            <CardDescription>Configure your document.</CardDescription>
          </CardHeader>

          <CardContent className="pt-6 pb-6 space-y-6">
            {/* Page Size */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold tracking-tight text-foreground/90">Page Size</Label>
              <Select value={settings.pageSize} onValueChange={(val) => setSettings({ ...settings, pageSize: val })}>
                <SelectTrigger className="w-full bg-muted/20 border-border/50 hover:bg-muted/40 transition-colors h-11">
                  <SelectValue placeholder="Select a page size" />
                </SelectTrigger>
                <SelectContent className="border-border/50 shadow-xl bg-background">
                  <SelectItem value="a4" className="cursor-pointer font-medium">A4 (210 x 297 mm)</SelectItem>
                  <SelectItem value="letter" className="cursor-pointer font-medium">US Letter (8.5 x 11 in)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Orientation */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold tracking-tight text-foreground/90">Orientation</Label>
              <RadioGroup value={settings.orientation} onValueChange={(val) => setSettings({ ...settings, orientation: val })} className="grid grid-cols-2 gap-3 mt-2">
                <div className="flex items-center space-x-2 p-3 rounded-xl border border-border/40 bg-muted/10 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSettings({ ...settings, orientation: 'portrait' })}>
                  <RadioGroupItem value="portrait" id="portrait" />
                  <Label htmlFor="portrait" className="font-semibold cursor-pointer w-full text-sm">Portrait</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-xl border border-border/40 bg-muted/10 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSettings({ ...settings, orientation: 'landscape' })}>
                  <RadioGroupItem value="landscape" id="landscape" />
                  <Label htmlFor="landscape" className="font-semibold cursor-pointer w-full text-sm">Landscape</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Margin */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold tracking-tight text-foreground/90">Margin</Label>
                <span className="text-xs font-mono bg-primary/10 text-primary px-2.5 py-1 rounded-md font-bold">{settings.margin} px</span>
              </div>
              <Slider 
                value={[settings.margin]} 
                max={100} 
                step={1} 
                onValueChange={(val) => setSettings({ ...settings, margin: Array.isArray(val) ? val[0] : val })} 
                className="py-2" 
              />
            </div>

            {/* Image Fit */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold tracking-tight text-foreground/90">Image Fit</Label>
              <Select value={settings.imageFit} onValueChange={(val) => setSettings({ ...settings, imageFit: val })}>
                <SelectTrigger className="w-full bg-muted/20 border-border/50 hover:bg-muted/40 transition-colors h-11">
                  <SelectValue placeholder="Select image fit" />
                </SelectTrigger>
                <SelectContent className="border-border/50 shadow-xl bg-background">
                  <SelectItem value="fill" className="cursor-pointer font-medium">Fill Page</SelectItem>
                  <SelectItem value="fit" className="cursor-pointer font-medium">Fit to Page</SelectItem>
                  <SelectItem value="stretch" className="cursor-pointer font-medium">Stretch to Page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <Button
          className="w-full h-16 rounded-2xl text-lg font-bold shadow-xl transition-all shrink-0"
          size="lg"
          disabled={isProcessing}
          onClick={() => !isProcessing && navigate('/download')}
        >
          {isProcessing ? 'Optimizing Images...' : 'Continue to Download'} 
          {!isProcessing && <ArrowRight className="w-5 h-5 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
