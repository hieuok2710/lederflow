import { EventType, Priority, DocumentStatus, EventColorMapping } from './types';

// Formatting helpers
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
};

export const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const isSameDay = (d1: Date, d2: Date): boolean => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const isOverdue = (date: Date): boolean => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d < now;
};

export const getRelativeTimeLabel = (date: Date): string => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  
  const diffTime = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Quá hạn';
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Ngày mai';
  
  return formatDate(date).split(',')[1]?.trim() || formatDate(date);
};

// Color Palettes for customization
export const COLOR_PALETTES = {
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  pink: 'bg-pink-100 text-pink-700 border-pink-200',
  rose: 'bg-rose-100 text-rose-700 border-rose-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  lime: 'bg-lime-100 text-lime-700 border-lime-200',
  green: 'bg-green-100 text-green-700 border-green-200',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  teal: 'bg-teal-100 text-teal-700 border-teal-200',
  cyan: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  sky: 'bg-sky-100 text-sky-700 border-sky-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
};

// Styling helpers
export const getEventTypeColor = (type: EventType, mapping?: EventColorMapping): string => {
  if (mapping && mapping[type]) {
    return mapping[type];
  }

  // Fallback defaults
  switch (type) {
    case EventType.MEETING: return COLOR_PALETTES.blue;
    case EventType.BUSINESS_TRIP: return COLOR_PALETTES.purple;
    case EventType.DEEP_WORK: return COLOR_PALETTES.slate;
    case EventType.EVENT: return COLOR_PALETTES.amber;
    case EventType.PERSONAL: return COLOR_PALETTES.green;
    default: return COLOR_PALETTES.gray;
  }
};

export const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case Priority.URGENT: return 'bg-red-100 text-red-700 border-red-200';
    case Priority.HIGH: return 'bg-orange-100 text-orange-700 border-orange-200';
    case Priority.NORMAL: return 'bg-blue-100 text-blue-700 border-blue-200';
    case Priority.LOW: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const getDocumentStatusColor = (status: DocumentStatus): string => {
  switch (status) {
    case DocumentStatus.PENDING: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case DocumentStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700 border-blue-200';
    case DocumentStatus.COMPLETED: return 'bg-green-100 text-green-700 border-green-200';
    case DocumentStatus.OVERDUE: return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700';
  }
};
