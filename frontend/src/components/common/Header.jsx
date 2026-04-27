import React from 'react';
import { NavLink } from 'react-router-dom';
import { Image as ImageIcon, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-8 bg-background border-b border-border/40 sticky top-0 z-50">
      <NavLink to="/" className="flex items-center gap-3">
        <div className="bg-primary p-2 rounded-lg text-primary-foreground shadow-sm">
          <ImageIcon className="w-5 h-5" strokeWidth={2.5} />
        </div>
        <span className="font-extrabold text-xl tracking-tight hidden sm:block">Img2PDF</span>
      </NavLink>
      <div className="flex items-center gap-4">
        <nav className="hidden md:flex gap-4">
          <NavLink to="/upload" className={({isActive}) => `text-sm font-semibold transition-colors hover:text-foreground ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>Upload</NavLink>
          <NavLink to="/preview" className={({isActive}) => `text-sm font-semibold transition-colors hover:text-foreground ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>Preview</NavLink>
        </nav>
        <NavLink to="/settings">
          <Button variant="ghost" size="sm" className="font-semibold text-muted-foreground hover:text-foreground">
            <Settings2 className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </NavLink>
        <Button className="hidden sm:flex font-bold shadow-sm rounded-full px-6">Sign In</Button>
      </div>
    </header>
  );
}
