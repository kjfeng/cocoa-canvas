import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    // Layout
    'flex', 'flex-col', 'flex-row', 'flex-wrap', 'flex-1',
    'items-center', 'items-start', 'items-end',
    'justify-between', 'justify-center', 'justify-end',
    'gap-1', 'gap-1.5', 'gap-2', 'gap-3', 'gap-4',
    'space-y-1', 'space-y-1.5', 'space-y-2', 'space-y-3', 'space-y-4',
    'grid', 'grid-cols-2', 'grid-cols-3', 'col-span-2',
    // Sizing
    'w-full', 'w-5', 'w-6', 'w-8', 'w-10',
    'h-5', 'h-6', 'h-8', 'h-10', 'h-20', 'h-24',
    'min-h-[60px]', 'max-w-none',
    // Spacing
    'p-0.5', 'p-1', 'p-2', 'p-3', 'p-4',
    'px-2', 'px-2.5', 'px-3', 'px-3.5', 'px-4',
    'py-1', 'py-1.5', 'py-2', 'py-2.5',
    'pt-1', 'pt-2', 'mt-0.5', 'mt-1', 'mt-2', 'mt-3',
    'mb-1', 'mb-1.5', 'mb-2', 'mb-3', 'ml-2',
    // Typography
    'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl',
    'font-medium', 'font-semibold', 'font-bold',
    'text-center', 'text-left', 'text-right',
    'leading-tight', 'tracking-wide',
    // Colors - text
    'text-stone-400', 'text-stone-500', 'text-stone-600', 'text-stone-700', 'text-stone-800',
    'text-sky-500', 'text-sky-600', 'text-sky-700', 'text-white',
    'text-red-500', 'text-amber-600', 'text-emerald-600',
    // Colors - background
    'bg-white', 'bg-stone-50', 'bg-stone-100', 'bg-stone-200',
    'bg-sky-50', 'bg-sky-100', 'bg-sky-500', 'bg-sky-600',
    'bg-amber-50', 'bg-emerald-50', 'bg-red-50',
    // Borders
    'border', 'border-t', 'border-b',
    'border-stone-100', 'border-stone-200', 'border-stone-300',
    'border-sky-200', 'border-sky-300', 'border-sky-500',
    'border-red-200', 'border-amber-200', 'border-emerald-200',
    'rounded', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-full',
    // Effects
    'shadow-sm', 'shadow', 'ring-2', 'ring-sky-200/50',
    'opacity-0', 'opacity-20', 'opacity-40', 'opacity-50', 'opacity-100',
    // Interactive
    'hover:bg-stone-50', 'hover:bg-stone-100', 'hover:bg-sky-600',
    'hover:border-stone-300', 'hover:border-sky-400',
    'hover:text-stone-600', 'hover:text-sky-700', 'hover:text-red-400',
    'cursor-pointer', 'transition-colors', 'transition-all', 'transition-shadow',
    'active:scale-95', 'disabled:opacity-40',
    // Focus
    'focus:outline-none', 'focus:ring-2', 'focus:ring-sky-200/50', 'focus:border-sky-300',
    // Other
    'resize-none', 'overflow-hidden', 'overflow-auto',
    'inline-flex', 'block', 'hidden',
    'relative', 'absolute', 'top-2', 'right-2',
    'select-none', 'whitespace-nowrap', 'truncate',
    'animate-pulse', 'accent-sky-500', 'placeholder:text-stone-400', 'group',
  ],
  theme: {
    extend: {
      colors: {
        cocoa: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#977669',
          800: '#846358',
          900: '#43302b',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
