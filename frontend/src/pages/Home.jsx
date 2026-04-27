import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, ShieldCheck, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col">
      <section className="w-full bg-primary pt-16 pb-32 px-4 text-primary-foreground relative">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            Image to PDF Converter
          </h1>
          <p className="text-lg md:text-xl font-medium opacity-90 max-w-2xl mx-auto leading-relaxed">
            Convert JPG, PNG, and WEBP images into beautiful PDF documents in seconds. 100% free, completely secure, and works entirely in your browser.
          </p>
          <div className="pt-4">
            <Button 
              size="lg" 
              className="h-14 px-8 text-lg font-bold rounded-full bg-background text-foreground hover:bg-background/90 transition-all hover:scale-105 active:scale-95 shadow-xl"
              onClick={() => navigate('/upload')}
            >
              Get Started <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-12 text-center -mt-10 relative z-10 bg-background rounded-3xl shadow-xl">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-2xl mb-2">
             <Zap className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h3 className="font-extrabold text-xl">Lightning Fast</h3>
          <p className="text-muted-foreground font-medium leading-relaxed">
            No software to install. Just drop your images and instantly generate your PDF document right inside your browser.
          </p>
        </div>
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-2xl mb-2">
             <ShieldCheck className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h3 className="font-extrabold text-xl">100% Secure</h3>
          <p className="text-muted-foreground font-medium leading-relaxed">
            Your privacy matters. Files are transmitted securely and automatically purged from our servers within minutes.
          </p>
        </div>
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-2xl mb-2">
             <Layers className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h3 className="font-extrabold text-xl">Perfect Formatting</h3>
          <p className="text-muted-foreground font-medium leading-relaxed">
            Maintain the original resolution. Tweak page sizes, margins, and fit options to build the exact PDF you need.
          </p>
        </div>
      </section>
    </div>
  );
}
