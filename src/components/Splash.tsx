import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown } from 'lucide-react';
import { useSettings } from './SettingsContext';

const Splash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [exit, setExit] = useState(false);
  const { theme, t } = useSettings();

  useEffect(() => {
    const timer = setTimeout(() => {
      setExit(true);
      setTimeout(onComplete, 1000);
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${theme.bg}`}>
      <motion.div
        initial={{ scale: 0, rotate: -45, opacity: 0 }}
        animate={{ scale: exit ? 25 : 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200, duration: 0.8 }}
        className="relative"
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotateZ: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Crown className="w-24 h-24 mb-6" strokeWidth={1.5} />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: exit ? 50 : 0, opacity: exit ? 0 : 1 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold tracking-tighter uppercase mb-2">
          {t.title}
        </h1>
        <div className="h-px w-12 bg-current mx-auto opacity-30 mb-4" />
        <p className="text-sm opacity-50 tracking-widest uppercase italic">
          {t.tagline}
        </p>
      </motion.div>
    </div>
  );
};

export default Splash;
