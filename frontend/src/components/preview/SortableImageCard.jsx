import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, RotateCw } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function SortableImageCard({ fileObj, onRemove, onRotate }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fileObj.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`relative overflow-hidden group border-border/40 bg-card/60 backdrop-blur-md transition-all duration-300 ease-out
        ${isDragging ? 'ring-2 ring-primary shadow-2xl scale-105' : 'shadow-sm hover:shadow-md hover:border-primary/40 hover:-translate-y-1'}`}
    >
      <CardContent className="p-2.5">
         {/* Drag Handle */}
         <div 
           {...attributes} 
           {...listeners}
           className="absolute top-3 left-3 z-20 p-1.5 rounded-md bg-background/90 text-muted-foreground backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing hover:bg-primary hover:text-primary-foreground shadow-sm ring-1 ring-border/50"
         >
           <GripVertical className="w-4 h-4" />
         </div>

         {/* Delete Button */}
         <Button
           variant="destructive"
           size="icon"
           className="absolute top-3 right-3 z-20 w-7 h-7 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm scale-95 hover:scale-105"
           onClick={(e) => { e.stopPropagation(); onRemove(fileObj.id); }}
         >
           <Trash2 className="w-3.5 h-3.5" />
         </Button>

         {/* Image Preview */}
         <div className="aspect-square w-full rounded-md overflow-hidden bg-muted/30 border border-border/40 flex items-center justify-center relative group-hover:ring-1 group-hover:ring-primary/20 transition-all">
            <img 
              src={fileObj.preview} 
              alt={fileObj.file.name} 
              className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
              style={{ transform: `rotate(${fileObj.rotation || 0}deg)` }}
            />
         </div>
      </CardContent>
      <CardFooter className="p-2.5 pt-0 flex justify-between items-center gap-2 mt-1">
         <div className="flex-1 min-w-0">
           <p className="text-[11px] font-semibold text-foreground truncate">{fileObj.file.name}</p>
           <p className="text-[10px] text-muted-foreground font-medium">{(fileObj.file.size / 1024 / 1024).toFixed(2)} MB</p>
         </div>
         <Button 
           variant="secondary" 
           size="icon" 
           className="w-7 h-7 flex-shrink-0 hover:bg-primary/10 hover:text-primary transition-colors" 
           onClick={(e) => { e.stopPropagation(); onRotate(fileObj.id); }}
           title="Rotate Image"
         >
           <RotateCw className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
         </Button>
      </CardFooter>
    </Card>
  )
}
