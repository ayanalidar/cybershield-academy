'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

function getMounted() { return true; }
function subscribe() { return () => {}; }

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, getMounted, getMounted);
  if (!mounted) return <div className="w-9 h-9" />;

  const cycle = () => {
    if (resolvedTheme === 'dark') setTheme('light');
    else if (resolvedTheme === 'light') setTheme('dark');
    else setTheme('dark');
  };

  return (
    <Button variant="ghost" size="icon" onClick={cycle} className="relative w-9 h-9 rounded-lg hover:bg-accent transition-colors" aria-label="Toggle theme">
      <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
