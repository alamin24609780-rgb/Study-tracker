import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [
    h > 0 ? h.toString().padStart(2, '0') : null,
    m.toString().padStart(2, '0'),
    s.toString().padStart(2, '0')
  ].filter(Boolean).join(':');
}

export const SUBJECT_ICONS = [
  'Atom', 'FlaskConical', 'Calculator', 'BookOpen', 'Scroll', 'Globe', 'Music', 'Palette', 'Cpu', 'Brain'
];

export const SUBJECT_GROUPS = ['Science', 'Commerce', 'Arts', 'Other'];
