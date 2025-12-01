
export enum EventType {
  MEETING = 'Họp',
  BUSINESS_TRIP = 'Công tác',
  EVENT = 'Sự kiện',
  PERSONAL = 'Cá nhân',
  DEEP_WORK = 'Xử lý văn bản'
}

export enum Priority {
  URGENT = 'Khẩn cấp',
  HIGH = 'Cao',
  NORMAL = 'Bình thường',
  LOW = 'Thấp'
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  CALENDAR_WEEK = 'CALENDAR_WEEK',
  CALENDAR_MONTH = 'CALENDAR_MONTH',
  TASKS = 'TASKS',
  DOCUMENTS = 'DOCUMENTS',
  USER_MANAGEMENT = 'USER_MANAGEMENT' // New view mode
}

export enum DocumentStatus {
  PENDING = 'Chờ xử lý',
  IN_PROGRESS = 'Đang xử lý',
  COMPLETED = 'Đã duyệt/Ký',
  OVERDUE = 'Quá hạn'
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: EventType;
  location?: string;
  description?: string;
  attendees?: string[];
}

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  completed: boolean;
  dueDate?: Date;
  assignee?: string; 
}

export interface Document {
  id: string;
  code: string; // Số ký hiệu (VD: 123/BC-UBND)
  title: string; // Trích yếu
  submitter: string; // Đơn vị trình
  deadline: Date; // Hạn xử lý
  status: DocumentStatus;
  priority: Priority;
  attachmentUrl?: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface NotificationSettings {
  reminderTime: number; // Minutes before event to notify (e.g., 15, 30, 60)
  checkFrequency: number; // How often to check in seconds (e.g., 60s)
  enableSound: boolean;
}

export type EventColorMapping = Record<EventType, string>;
