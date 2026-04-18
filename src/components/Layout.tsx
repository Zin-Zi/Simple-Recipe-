import React from 'react';
import { motion } from 'motion/react';
import { useSettings } from './SettingsContext';
import { ArrowLeft, Share2, Printer, ChevronLeft } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, title, onBack, actions }) => {
  const { theme } = useSettings();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Dynamic Header */}
      <header className={cn(
        "p-4 flex items-center justify-between border-b sticky top-0 z-10 transition-all",
        theme.border,
        theme.id === 'frosted' ? 'glass-panel !border-white/10' : `backdrop-blur-md ${theme.bg} bg-opacity-80`
      )}>
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-black/5 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {title && (
            <h1 className="text-xl font-bold tracking-tight uppercase">
              {title}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-2">
          {actions}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;
