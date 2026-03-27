import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { flushSync } from 'react-dom';

interface ThemeToggleProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
    const handleToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
        // Fallback for browsers that don't support View Transitions or prefer reduced motion
        if (
            !document.startViewTransition ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
            toggleTheme();
            return;
        }

        const x = e.clientX;
        const y = e.clientY;
        const right = window.innerWidth - x;
        const bottom = window.innerHeight - y;
        const maxRadius = Math.hypot(Math.max(x, right), Math.max(y, bottom));

        const transition = document.startViewTransition(() => {
            flushSync(() => {
                toggleTheme();
            });
        });

        await transition.ready;

        document.documentElement.animate(
            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${maxRadius}px at ${x}px ${y}px)`,
                ],
            },
            {
                duration: 500,
                easing: 'ease-in-out',
                pseudoElement: '::view-transition-new(root)',
            }
        );
    };

    const isDark = theme === 'dark';

    return (
        <button
            onClick={handleToggle}
            aria-label="Toggle Theme"
            title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
            className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
        transition-all duration-300 select-none cursor-pointer
        border shadow-sm
        ${isDark
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700 hover:border-zinc-600'
                    : 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-200'
                }
      `}
        >
            {isDark ? (
                <Sun size={16} className="flex-shrink-0" />
            ) : (
                <Moon size={16} className="flex-shrink-0" />
            )}
            <span>{isDark ? 'Light' : 'Dark'}</span>
        </button>
    );
};

export default ThemeToggle;
