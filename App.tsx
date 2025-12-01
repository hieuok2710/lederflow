
import React, { useState, useEffect, useRef } from 'react';
import { ViewMode, CalendarEvent, Task, EventType, Priority, Document, DocumentStatus, EventColorMapping, User, NotificationSettings } from './types';
import { Dashboard } from './components/Dashboard';
import { Calendar } from './components/Calendar';
import { TaskList } from './components/TaskList';
import { DocumentList } from './components/DocumentList';
import { SmartAddModal } from './components/SmartAddModal';
import { LoginScreen } from './components/LoginScreen';
import { UserManagement } from './components/UserManagement';
import { LayoutDashboard, Calendar as CalIcon, CheckSquare, Plus, Bell, FileText, Menu, X, Home, Clock, BellRing, MapPin, CalendarClock, AlertCircle, Briefcase, ChevronRight, LogOut, Users, Settings, Volume2, VolumeX } from 'lucide-react';
import { COLOR_PALETTES, formatTime, getPriorityColor, formatDate } from './utils';

// Simple ID generator for this environment
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock Data (Used only if LocalStorage is empty)
const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Họp giao ban đầu tuần',
    start: new Date(new Date().setHours(8, 0, 0, 0)),
    end: new Date(new Date().setHours(9, 30, 0, 0)),
    type: EventType.MEETING,
    location: 'Phòng họp A'
  },
  {
    id: '2',
    title: 'Tiếp đối tác Samsung',
    start: new Date(new Date().setHours(14, 0, 0, 0)),
    end: new Date(new Date().setHours(15, 30, 0, 0)),
    type: EventType.EVENT,
    location: 'Sảnh VIP'
  },
  {
    id: 'demo-future',
    title: 'Kiểm tra hiện trường dự án X (Gấp)',
    start: new Date(new Date().getTime() + 45 * 60 * 1000), // 45 minutes from now
    end: new Date(new Date().getTime() + 4 * 60 * 60 * 1000),
    type: EventType.BUSINESS_TRIP,
    location: 'Khu công nghiệp phía Nam',
    description: 'Sự kiện demo thông báo'
  }
];

const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Phê duyệt ngân sách Q4',
    priority: Priority.URGENT,
    completed: false,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1))
  },
  {
    id: 't2',
    title: 'Chuẩn bị bài phát biểu hội nghị',
    priority: Priority.HIGH,
    completed: false,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 3))
  },
  {
    id: 't4',
    title: 'Gửi email báo cáo tiến độ (Demo 30p)',
    priority: Priority.URGENT,
    completed: false,
    dueDate: new Date(new Date().getTime() + 30 * 60 * 1000) // Due in 30 mins
  }
];

const INITIAL_DOCUMENTS: Document[] = [
  {
    id: 'd1',
    code: '154/BC-KHTC',
    title: 'Báo cáo tình hình thực hiện kế hoạch vốn đầu tư công tháng 10/2023',
    submitter: 'Phòng Kế hoạch Tài chính',
    deadline: new Date(new Date().setHours(17, 0, 0, 0)), // Today at 17:00
    status: DocumentStatus.PENDING,
    priority: Priority.URGENT
  },
  {
    id: 'd2',
    code: '23/TTr-UBND',
    title: 'Tờ trình phê duyệt quy hoạch chi tiết 1/500 Khu đô thị phía Nam',
    submitter: 'Phòng Quản lý Đô thị',
    deadline: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(10, 30, 0, 0)), // 2 days later at 10:30
    status: DocumentStatus.IN_PROGRESS,
    priority: Priority.HIGH
  }
];

// Default Colors
const INITIAL_COLORS: EventColorMapping = {
  [EventType.MEETING]: COLOR_PALETTES.blue,
  [EventType.BUSINESS_TRIP]: COLOR_PALETTES.purple,
  [EventType.EVENT]: COLOR_PALETTES.amber,
  [EventType.PERSONAL]: COLOR_PALETTES.green,
  [EventType.DEEP_WORK]: COLOR_PALETTES.slate,
};

// Default Notification Settings
const INITIAL_NOTIF_SETTINGS: NotificationSettings = {
  reminderTime: 30, // 30 minutes before
  checkFrequency: 60, // check every 60 seconds
  enableSound: true
};

// --- NEW COMPONENT: Daily Summary Modal ---
const DailySummaryModal = ({ 
  events, 
  tasks, 
  onClose,
  onViewDetails,
  username
}: { 
  events: CalendarEvent[], 
  tasks: Task[], 
  onClose: () => void,
  onViewDetails: () => void,
  username: string
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm md:max-w-md overflow-hidden transform transition-all scale-100">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold mb-1">Xin chào, {username}!</h2>
          <p className="text-indigo-100 text-sm">{formatDate(new Date())}</p>
        </div>
        
        <div className="p-6">
          <h3 className="text-gray-900 font-semibold mb-4 text-center">Tổng quan lịch trình hôm nay</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-200 rounded-lg text-indigo-700">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">{events.length} Sự kiện</p>
                  <p className="text-xs text-gray-500">Lịch họp & Công tác</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-200 rounded-lg text-amber-700">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">{tasks.length} Việc gấp</p>
                  <p className="text-xs text-gray-500">Cần xử lý ngay</p>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={onViewDetails}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
          >
            Xem chi tiết <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- AUTHENTICATED APP COMPONENT ---
// This contains the main logic. It is keyed by user ID in the parent to ensure complete reset on logout/login.
const AuthenticatedApp: React.FC<{ currentUser: User; onLogout: () => void }> = ({ currentUser, onLogout }) => {
  const [view, setView] = useState<ViewMode>(ViewMode.DASHBOARD);
  
  // Storage Keys with User ID prefix
  const STORAGE_KEYS = {
    EVENTS: `leaderflow_${currentUser.id}_events`,
    TASKS: `leaderflow_${currentUser.id}_tasks`,
    DOCS: `leaderflow_${currentUser.id}_documents`,
    COLORS: `leaderflow_${currentUser.id}_colors`,
    NOTIF_SETTINGS: `leaderflow_${currentUser.id}_notif_settings`,
  };

  // Global DB key for user management (Only for Admin)
  const USERS_DB_KEY = 'leaderflow_users_db';

  // --- STATE WITH LOCAL STORAGE PERSISTENCE ---
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (saved) {
      try {
        return JSON.parse(saved).map((e: any) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end)
        }));
      } catch (e) { return INITIAL_EVENTS; }
    }
    return INITIAL_EVENTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (saved) {
      try {
        return JSON.parse(saved).map((t: any) => ({
          ...t,
          dueDate: t.dueDate ? new Date(t.dueDate) : undefined
        }));
      } catch (e) { return INITIAL_TASKS; }
    }
    return INITIAL_TASKS;
  });

  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DOCS);
    if (saved) {
      try {
        return JSON.parse(saved).map((d: any) => ({
          ...d,
          deadline: new Date(d.deadline)
        }));
      } catch (e) { return INITIAL_DOCUMENTS; }
    }
    return INITIAL_DOCUMENTS;
  });

  const [eventColors, setEventColors] = useState<EventColorMapping>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COLORS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_COLORS; }
    }
    return INITIAL_COLORS;
  });
  
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIF_SETTINGS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_NOTIF_SETTINGS; }
    }
    return INITIAL_NOTIF_SETTINGS;
  });

  // State for User Management (Admin Only)
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const [showSmartAdd, setShowSmartAdd] = useState(false);
  const [smartAddInitialTab, setSmartAddInitialTab] = useState<'event' | 'document' | 'task'>('event');
  const [smartAddData, setSmartAddData] = useState<any>(null); // Data for editing
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false); // Settings Modal
  
  const [showDailySummary, setShowDailySummary] = useState(false); 
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  
  const notifiedItemsRef = useRef<Set<string>>(new Set());

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }, [events, STORAGE_KEYS.EVENTS]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks, STORAGE_KEYS.TASKS]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(documents));
  }, [documents, STORAGE_KEYS.DOCS]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COLORS, JSON.stringify(eventColors));
  }, [eventColors, STORAGE_KEYS.COLORS]);
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIF_SETTINGS, JSON.stringify(notifSettings));
  }, [notifSettings, STORAGE_KEYS.NOTIF_SETTINGS]);

  // Load users if Admin
  useEffect(() => {
    if (currentUser.role === 'Admin') {
      const savedUsers = localStorage.getItem(USERS_DB_KEY);
      if (savedUsers) {
        setAllUsers(JSON.parse(savedUsers));
      }
    }
  }, [currentUser.role]);


  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    
    // Check notifications safely
    try {
        const today = new Date();
        const todayStr = today.toDateString();
        
        const todaysEvents = events.filter(e => new Date(e.start).toDateString() === todayStr);
        const urgentTasks = tasks.filter(t => !t.completed && (t.priority === Priority.URGENT || t.priority === Priority.HIGH));
        
        if (todaysEvents.length > 0 || urgentTasks.length > 0) {
          setShowDailySummary(true);
          
          if (Notification.permission === 'granted' && notifSettings.enableSound) {
            new Notification("📅 Lịch trình hôm nay", {
              body: `Xin chào ${currentUser.fullName}, bạn có ${todaysEvents.length} sự kiện và ${urgentTasks.length} việc gấp hôm nay.`,
              icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
              tag: 'daily-summary'
            });
          }
        }
    } catch (e) {
        console.error("Notification check failed", e);
    }
  }, []);

  const handleTaskToggle = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDocumentStatusUpdate = (id: string, newStatus: DocumentStatus) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
  };

  const handleAddEvent = (eventData: Partial<CalendarEvent>) => {
    if (eventData.id) {
       // Update existing event
       setEvents(prev => prev.map(e => e.id === eventData.id ? { ...e, ...eventData } as CalendarEvent : e));
       alert("Đã cập nhật sự kiện thành công!");
    } else {
       // Create new event
       const newEvent: CalendarEvent = {
        id: generateId(),
        title: eventData.title || 'Sự kiện mới',
        start: eventData.start || new Date(),
        end: eventData.end || new Date(new Date().getTime() + 3600000),
        type: eventData.type || EventType.PERSONAL,
        description: eventData.description,
        location: eventData.location
      };
      setEvents(prev => [...prev, newEvent]);
      alert("Đã thêm sự kiện thành công!");
    }
    setSmartAddData(null);
    setView(ViewMode.CALENDAR_WEEK);
  };

  const handleAddDocument = (docData: Partial<Document>) => {
    if (docData.id) {
        // Update existing document
        setDocuments(prev => prev.map(d => d.id === docData.id ? { ...d, ...docData } as Document : d));
        alert("Đã cập nhật văn bản thành công!");
    } else {
        // Create new document
        const newDoc: Document = {
            id: generateId(),
            code: docData.code || '',
            title: docData.title || '',
            submitter: docData.submitter || '',
            deadline: docData.deadline || new Date(),
            status: docData.status || DocumentStatus.PENDING,
            priority: docData.priority || Priority.NORMAL,
            attachmentUrl: docData.attachmentUrl
        };
        setDocuments(prev => [...prev, newDoc]);
        alert("Đã thêm văn bản thành công!");
    }
    setSmartAddData(null);
    setView(ViewMode.DOCUMENTS);
  };

  const handleAddTask = (taskData: Partial<Task>) => {
    if (taskData.id) {
        // Update existing task
        setTasks(prev => prev.map(t => t.id === taskData.id ? { ...t, ...taskData } as Task : t));
        alert("Đã cập nhật công việc thành công!");
    } else {
        // Create new task
        const newTask: Task = {
            id: generateId(),
            title: taskData.title || '',
            priority: taskData.priority || Priority.NORMAL,
            completed: false,
            dueDate: taskData.dueDate,
            assignee: taskData.assignee
        };
        setTasks(prev => [...prev, newTask]);
        alert("Đã thêm công việc thành công!");
    }
    setSmartAddData(null);
    setView(ViewMode.TASKS);
  };

  const handleColorUpdate = (type: EventType, colorClass: string) => {
    setEventColors(prev => ({
      ...prev,
      [type]: colorClass
    }));
  };

  // --- USER MANAGEMENT HANDLERS ---
  const handleAddUser = (user: any) => {
      const updatedUsers = [...allUsers, user];
      setAllUsers(updatedUsers);
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(updatedUsers));
      alert("Đã thêm người dùng thành công.");
  };

  const handleEditUser = (user: any) => {
      const updatedUsers = allUsers.map(u => u.id === user.id ? user : u);
      setAllUsers(updatedUsers);
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(updatedUsers));
      alert("Đã cập nhật thông tin người dùng.");
  };

  const handleDeleteUser = (userId: string) => {
      const updatedUsers = allUsers.filter(u => u.id !== userId);
      setAllUsers(updatedUsers);
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(updatedUsers));
  };


  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert("Trình duyệt này không hỗ trợ thông báo hệ thống.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        new Notification("LeaderFlow", {
          body: "Đã bật thông báo nhắc nhở việc gấp!",
          icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        });
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
    }
  };

  const getUpcomingItems = () => {
    const now = new Date();
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingTasks = tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      const due = new Date(t.dueDate);
      return due > now && due <= next24h;
    }).map(t => ({ ...t, itemType: 'task' as const, date: new Date(t.dueDate!) }));

    const upcomingDocs = documents.filter(d => {
      if (d.status === DocumentStatus.COMPLETED) return false;
      const deadline = new Date(d.deadline);
      return deadline > now && deadline <= next24h;
    }).map(d => ({ ...d, itemType: 'document' as const, date: new Date(d.deadline) }));

    const upcomingEvents = events.filter(e => {
        const start = new Date(e.start);
        return start > now && start <= next24h;
    }).map(e => ({ ...e, itemType: 'event' as const, date: new Date(e.start) }));

    return [...upcomingTasks, ...upcomingDocs, ...upcomingEvents].sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const upcomingItems = getUpcomingItems();
  const hasUrgentItems = tasks.some(t => t.priority === Priority.URGENT) || documents.some(d => d.status === DocumentStatus.OVERDUE);
  
  const hasImminentItems = upcomingItems.some(item => {
    const now = new Date();
    const checkTime = new Date(now.getTime() + notifSettings.reminderTime * 60 * 1000); // Dynamic check window
    return item.date <= checkTime;
  });

  useEffect(() => {
    if (notificationPermission !== 'granted') return;

    const checkAndNotify = () => {
      const now = new Date();
      // Use dynamic reminder time setting
      const reminderWindow = new Date(now.getTime() + notifSettings.reminderTime * 60 * 1000);
      
      const allItems = getUpcomingItems();
      const immediateItems = allItems.filter(item => {
        return item.date > now && item.date <= reminderWindow;
      });

      immediateItems.forEach(item => {
        // Check if we already notified about this item recently? 
        // For simplicity, we assume we want to notify once per "event" appearing in the window.
        // But if the window is long (e.g. 60m) and frequency short (60s), we shouldn't spam.
        // notifiedItemsRef keeps track of IDs notified.
        // Ideally, we might want to re-notify if it gets VERY close (e.g. 5 mins), but keeping it simple.
        
        if (!notifiedItemsRef.current.has(item.id)) {
          const timeLeft = Math.ceil((item.date.getTime() - now.getTime()) / (1000 * 60));
          
          let body = '';
          if (item.itemType === 'event') body = `Sự kiện "${item.title}" sẽ diễn ra trong ${timeLeft} phút nữa.`;
          if (item.itemType === 'task') body = `Hạn chót công việc "${item.title}" còn ${timeLeft} phút.`;
          if (item.itemType === 'document') body = `Văn bản "${item.code}" cần xử lý trong ${timeLeft} phút.`;

          new Notification("Nhắc nhở gấp! ⏰", {
            body: body,
            icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            requireInteraction: true,
            tag: item.id,
            silent: !notifSettings.enableSound
          });
          
          notifiedItemsRef.current.add(item.id);
        }
      });
    };

    checkAndNotify();
    // Use dynamic check frequency (convert seconds to ms)
    const timer = setInterval(checkAndNotify, notifSettings.checkFrequency * 1000);
    return () => clearInterval(timer);
  }, [notificationPermission, tasks, events, documents, notifSettings]);

  const NavItem = ({ mode, icon: Icon, label }: { mode: ViewMode, icon: any, label: string }) => (
    <button
      onClick={() => {
        setView(mode);
        setSidebarOpen(false);
      }}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
        view === mode || (mode === ViewMode.CALENDAR_WEEK && view === ViewMode.CALENDAR_MONTH)
          ? 'bg-indigo-50 text-indigo-700' 
          : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  const getTodayStats = () => {
    const today = new Date();
    const todayStr = today.toDateString();
    const todaysEvents = events.filter(e => new Date(e.start).toDateString() === todayStr);
    const urgentTasks = tasks.filter(t => !t.completed && (t.priority === Priority.URGENT || t.priority === Priority.HIGH));
    return { events: todaysEvents, tasks: urgentTasks };
  };

  const openSmartAdd = (tab: 'event' | 'document' | 'task', data?: any) => {
    setSmartAddInitialTab(tab);
    setSmartAddData(data || null);
    setShowSmartAdd(true);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Settings Modal */}
      {showNotifSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-indigo-600" /> Cài đặt Thông báo
                    </h3>
                    <button onClick={() => setShowNotifSettings(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-5 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nhắc trước thời gian (phút)</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="1"
                                value={notifSettings.reminderTime}
                                onChange={(e) => setNotifSettings(prev => ({...prev, reminderTime: Math.max(1, parseInt(e.target.value) || 0)}))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white pr-12"
                                placeholder="Nhập số phút..."
                            />
                            <span className="absolute right-3 top-2 text-gray-400 text-sm pointer-events-none">phút</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Nhập số phút bạn muốn hệ thống nhắc trước (VD: 1440 = 1 ngày).</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tần suất kiểm tra</label>
                        <select 
                            value={notifSettings.checkFrequency}
                            onChange={(e) => setNotifSettings(prev => ({...prev, checkFrequency: parseInt(e.target.value)}))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        >
                            <option value="30">Mỗi 30 giây</option>
                            <option value="60">Mỗi 1 phút</option>
                            <option value="300">Mỗi 5 phút</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Âm thanh thông báo</span>
                        <button 
                            onClick={() => setNotifSettings(prev => ({...prev, enableSound: !prev.enableSound}))}
                            className={`p-2 rounded-lg transition-colors ${notifSettings.enableSound ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}
                        >
                            {notifSettings.enableSound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                <div className="p-4 border-t border-gray-100 flex justify-end">
                    <button 
                        onClick={() => setShowNotifSettings(false)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm"
                    >
                        Lưu cài đặt
                    </button>
                </div>
            </div>
        </div>
      )}

      {showDailySummary && (
        <DailySummaryModal 
          events={getTodayStats().events}
          tasks={getTodayStats().tasks}
          onClose={() => setShowDailySummary(false)}
          onViewDetails={() => {
            setShowDailySummary(false);
            setView(ViewMode.DASHBOARD);
          }}
          username={currentUser.fullName}
        />
      )}

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {showNotifications && (
        <div 
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setShowNotifications(false)}
        />
      )}

      {/* Sidebar (Desktop) */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 hidden lg:flex
      `}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="font-bold text-xl text-gray-800">LeaderFlow</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 space-y-1 flex-1">
          <NavItem mode={ViewMode.DASHBOARD} icon={LayoutDashboard} label="Tổng quan" />
          <NavItem mode={ViewMode.CALENDAR_WEEK} icon={CalIcon} label="Lịch công tác" />
          <NavItem mode={ViewMode.TASKS} icon={CheckSquare} label="Nhắc việc" />
          <NavItem mode={ViewMode.DOCUMENTS} icon={FileText} label="Văn bản & Báo cáo" />
          
          {/* Admin Only Menu */}
          {currentUser.role === 'Admin' && (
             <div className="pt-4 mt-4 border-t border-gray-100">
                <p className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Quản trị</p>
                <NavItem mode={ViewMode.USER_MANAGEMENT} icon={Users} label="Quản lý tài khoản" />
             </div>
          )}
        </div>

        {/* User Info & Logout (Desktop Sidebar) */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{currentUser.fullName}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser.role === 'Admin' ? 'Quản trị viên' : 'Lãnh đạo'}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>

        <div className="p-4 pt-0">
          <button 
            onClick={() => openSmartAdd('event')}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-lg px-4 py-3 font-medium shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Tạo mới
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 px-6 py-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-end">
          <button 
            onClick={() => setView(ViewMode.DASHBOARD)}
            className={`flex flex-col items-center gap-1 p-2 ${view === ViewMode.DASHBOARD ? 'text-indigo-600' : 'text-gray-400'}`}
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-medium">Tổng quan</span>
          </button>

          <button 
             onClick={() => setView(ViewMode.CALENDAR_WEEK)}
             className={`flex flex-col items-center gap-1 p-2 ${view === ViewMode.CALENDAR_WEEK || view === ViewMode.CALENDAR_MONTH ? 'text-indigo-600' : 'text-gray-400'}`}
          >
            <CalIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">Lịch</span>
          </button>

          <div className="relative -top-6">
            <button 
              onClick={() => openSmartAdd('event')}
              className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-indigo-700 transition-colors border-4 border-gray-50"
            >
              <Plus className="w-8 h-8" />
            </button>
          </div>

          <button 
             onClick={() => setView(ViewMode.TASKS)}
             className={`flex flex-col items-center gap-1 p-2 ${view === ViewMode.TASKS ? 'text-indigo-600' : 'text-gray-400'}`}
          >
            <CheckSquare className="w-6 h-6" />
            <span className="text-[10px] font-medium">Việc</span>
          </button>

          <button 
             onClick={() => setView(ViewMode.DOCUMENTS)}
             className={`flex flex-col items-center gap-1 p-2 ${view === ViewMode.DOCUMENTS ? 'text-indigo-600' : 'text-gray-400'}`}
          >
            <FileText className="w-6 h-6" />
            <span className="text-[10px] font-medium">Văn bản</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-3 md:p-4 lg:p-8 transition-all duration-300 pb-24 lg:pb-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-4 md:mb-6 lg:mb-8 gap-2">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
             {/* Mobile Menu Button - Important to access Sidebar on mobile */}
             <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
             >
                <Menu className="w-6 h-6" />
             </button>

             <div className="min-w-0 flex-1">
                <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight truncate">
                  {view === ViewMode.DASHBOARD && 'Bảng điều khiển'}
                  {(view === ViewMode.CALENDAR_WEEK || view === ViewMode.CALENDAR_MONTH) && 'Lịch làm việc'}
                  {view === ViewMode.TASKS && 'Danh sách công việc'}
                  {view === ViewMode.DOCUMENTS && 'Quản lý văn bản'}
                  {view === ViewMode.USER_MANAGEMENT && 'Quản trị hệ thống'}
                </h1>
                <p className="text-gray-500 text-xs lg:text-sm mt-1 hidden sm:block truncate">Quản lý hiệu quả, lãnh đạo thành công</p>
             </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 lg:gap-4 relative flex-shrink-0">
             {notificationPermission !== 'granted' && notificationPermission !== 'denied' && (
               <button 
                 onClick={requestNotificationPermission}
                 className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium hover:bg-indigo-100 transition-colors"
               >
                 <BellRing className="w-4 h-4" />
                 Bật thông báo
               </button>
             )}

             <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 transition-colors relative rounded-full 
                    ${showNotifications ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-50'}
                    ${hasImminentItems ? 'animate-bell-shake text-red-600' : ''} 
                  `}
                >
                  <Bell className="w-6 h-6" />
                  {(hasUrgentItems || upcomingItems.length > 0) && (
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-72 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden transform origin-top-right transition-all">
                    <div className="p-3 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800 text-sm">Sắp đến hạn</h3>
                        <span className="text-xs font-medium px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                          {upcomingItems.length}
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          setShowNotifications(false);
                          setShowNotifSettings(true);
                        }}
                        className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-indigo-600"
                        title="Cài đặt thông báo"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {notificationPermission !== 'granted' && (
                        <div className="p-3 bg-blue-50 border-b border-blue-100">
                             <button 
                                onClick={requestNotificationPermission}
                                className="w-full flex items-center justify-center gap-2 text-blue-700 text-xs font-medium hover:underline"
                             >
                                <BellRing className="w-3 h-3" />
                                Bật thông báo đẩy về thiết bị
                             </button>
                        </div>
                    )}

                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {upcomingItems.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                          <Clock className="w-10 h-10 text-gray-300 mb-2" />
                          <p className="text-sm">Không có mục nào sắp đến hạn ({notifSettings.reminderTime}p tới).</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {upcomingItems.map((item: any) => (
                            <div key={item.id} className="p-3 hover:bg-gray-50 transition-colors flex gap-3 group cursor-pointer" onClick={() => {
                                if (item.itemType === 'task') setView(ViewMode.TASKS);
                                else if (item.itemType === 'document') setView(ViewMode.DOCUMENTS);
                                else setView(ViewMode.CALENDAR_WEEK);
                                setShowNotifications(false);
                            }}>
                              <div className={`mt-1.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                item.priority === Priority.URGENT ? 'bg-red-100 text-red-600' : 
                                item.itemType === 'event' ? 'bg-purple-100 text-purple-600' : 
                                item.itemType === 'task' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                              }`}>
                                {item.itemType === 'event' ? <CalendarClock className="w-4 h-4" /> : 
                                 item.itemType === 'task' ? <CheckSquare className="w-4 h-4" /> : 
                                 <AlertCircle className="w-4 h-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-0.5">
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-semibold tracking-wider ${
                                      item.itemType === 'task' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                      item.itemType === 'document' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                      'bg-purple-50 text-purple-700 border-purple-100'
                                    }`}>
                                    {item.itemType === 'task' ? 'Việc' : item.itemType === 'document' ? 'Văn bản' : 'Sự kiện'}
                                  </span>
                                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                    {formatTime(item.date)}
                                  </span>
                                </div>
                                <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug mb-1 group-hover:text-indigo-700 transition-colors">
                                  {item.title}
                                </p>
                                <div className="flex items-center gap-2">
                                   {item.priority && <span className={`text-[10px] border px-1 rounded ${getPriorityColor(item.priority)}`}>{item.priority}</span>}
                                   {item.code && <span className="text-[10px] text-gray-400">#{item.code}</span>}
                                   {item.location && <span className="text-[10px] text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3"/> {item.location}</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-2 border-t border-gray-50 bg-gray-50/50 text-center">
                      <button 
                        onClick={() => {
                          setShowNotifications(false);
                          setView(ViewMode.DASHBOARD);
                        }}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        Xem tất cả
                      </button>
                    </div>
                  </div>
                )}
             </div>

             {/* Mobile User/Logout */}
             <div className="lg:hidden flex items-center">
                <button onClick={onLogout} className="p-2 text-gray-500 hover:text-red-600">
                    <LogOut className="w-5 h-5" />
                </button>
             </div>

             <div className="hidden lg:flex items-center gap-3 pl-2 md:pl-3 lg:pl-4 border-l border-gray-200">
                <div className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs md:text-sm lg:text-base">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{currentUser.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{currentUser.role === 'Admin' ? 'Quản trị viên' : 'Lãnh đạo'}</p>
                </div>
             </div>
          </div>
        </header>

        {/* Views */}
        <div className="max-w-7xl mx-auto">
          {view === ViewMode.DASHBOARD && (
            <Dashboard 
              events={events} 
              tasks={tasks} 
              documents={documents}
              eventColors={eventColors}
              onTaskToggle={handleTaskToggle}
              onViewAllDocuments={() => setView(ViewMode.DOCUMENTS)}
              onAddTaskClick={() => openSmartAdd('task')}
            />
          )}
          {(view === ViewMode.CALENDAR_WEEK || view === ViewMode.CALENDAR_MONTH) && (
            <Calendar 
              events={events} 
              mode={view} 
              onModeChange={setView}
              eventColors={eventColors}
              onColorChange={handleColorUpdate}
              onAddEventClick={() => openSmartAdd('event')}
              onEditEvent={(event) => openSmartAdd('event', event)}
            />
          )}
          {view === ViewMode.TASKS && (
            <TaskList 
              tasks={tasks} 
              onToggle={handleTaskToggle} 
              onAddTaskClick={() => openSmartAdd('task')}
            />
          )}
          {view === ViewMode.DOCUMENTS && (
            <DocumentList 
              documents={documents} 
              onUpdateStatus={handleDocumentStatusUpdate} 
              onAddDocumentClick={() => openSmartAdd('document')}
            />
          )}
          {view === ViewMode.USER_MANAGEMENT && currentUser.role === 'Admin' && (
             <UserManagement 
               users={allUsers}
               onAddUser={handleAddUser}
               onEditUser={handleEditUser}
               onDeleteUser={handleDeleteUser}
               currentUser={currentUser}
             />
          )}
        </div>
      </main>

      {/* Smart Add Modal */}
      {showSmartAdd && (
        <SmartAddModal 
          onClose={() => setShowSmartAdd(false)}
          onAddEvent={handleAddEvent}
          onAddDocument={handleAddDocument}
          onAddTask={handleAddTask}
          initialTab={smartAddInitialTab}
          initialData={smartAddData}
        />
      )}
    </div>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('leaderflow_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('leaderflow_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('leaderflow_current_user');
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // KEY PROP is crucial here. When User ID changes, AuthenticatedApp unmounts and remounts,
  // resetting all internal state and loading fresh data from LocalStorage based on the new ID.
  return <AuthenticatedApp key={currentUser.id} currentUser={currentUser} onLogout={handleLogout} />;
}
