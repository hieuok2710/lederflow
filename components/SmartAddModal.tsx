import React, { useState, useEffect } from 'react';
import { CalendarEvent, EventType, Document, Priority, DocumentStatus, Task } from '../types';
import { X, Calendar, MapPin, AlignLeft, FileText, AlertCircle, Building, Hash, CheckSquare, User, Clock } from 'lucide-react';

interface SmartAddModalProps {
  onClose: () => void;
  onAddEvent: (event: Partial<CalendarEvent>) => void;
  onAddDocument: (doc: Partial<Document>) => void;
  onAddTask: (task: Partial<Task>) => void;
  initialTab?: 'event' | 'document' | 'task';
  initialData?: any; // Data for editing
}

type TabType = 'event' | 'document' | 'task';

export const SmartAddModal: React.FC<SmartAddModalProps> = ({ onClose, onAddEvent, onAddDocument, onAddTask, initialTab = 'event', initialData }) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // Get current date string for min attribute to disable past dates
  const now = new Date();
  const currentDateTime = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  
  // Event Form State
  const [eventData, setEventData] = useState({
    title: '',
    start: currentDateTime, // Current time default
    end: new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16), // +1 hour default
    type: EventType.MEETING,
    location: '',
    description: ''
  });

  // Document Form State
  const [docData, setDocData] = useState({
    code: '',
    title: '',
    submitter: '',
    deadline: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // +1 day default
    priority: Priority.NORMAL
  });

  // Task Form State
  const [taskData, setTaskData] = useState({
    title: '',
    priority: Priority.NORMAL,
    dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // +1 day default
    assignee: ''
  });

  // Helper to convert Date object or string to ISO string for inputs
  const toInputString = (date: Date | string) => {
    if (!date) return '';
    const d = new Date(date);
    // Adjust for timezone offset to show correct local time in input
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  };

  // Populate form if initialData exists (Edit Mode)
  useEffect(() => {
    if (initialData) {
      if (initialTab === 'event') {
        setEventData({
          title: initialData.title || '',
          start: toInputString(initialData.start),
          end: toInputString(initialData.end),
          type: initialData.type || EventType.MEETING,
          location: initialData.location || '',
          description: initialData.description || ''
        });
      } else if (initialTab === 'document') {
        setDocData({
          code: initialData.code || '',
          title: initialData.title || '',
          submitter: initialData.submitter || '',
          deadline: toInputString(initialData.deadline),
          priority: initialData.priority || Priority.NORMAL
        });
      } else if (initialTab === 'task') {
        setTaskData({
          title: initialData.title || '',
          priority: initialData.priority || Priority.NORMAL,
          dueDate: toInputString(initialData.dueDate),
          assignee: initialData.assignee || ''
        });
      }
    }
  }, [initialData, initialTab]);

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: value }));
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDocData(prev => ({ ...prev, [name]: value }));
  };

  const handleTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTaskData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'event') {
      if (!eventData.title || !eventData.start || !eventData.end) return;
      onAddEvent({
        ...initialData, // Preserve ID if editing
        title: eventData.title,
        start: new Date(eventData.start),
        end: new Date(eventData.end),
        type: eventData.type as EventType,
        location: eventData.location,
        description: eventData.description
      });
    } else if (activeTab === 'document') {
      // Validate document fields
      if (!docData.code || !docData.title || !docData.deadline) {
        alert("Vui lòng điền đầy đủ: Số ký hiệu, Trích yếu và Hạn xử lý.");
        return;
      }
      onAddDocument({
        ...initialData, // Preserve ID if editing
        code: docData.code,
        title: docData.title,
        submitter: docData.submitter,
        deadline: new Date(docData.deadline),
        priority: docData.priority as Priority,
        status: initialData?.status || DocumentStatus.PENDING
      });
    } else if (activeTab === 'task') {
      if (!taskData.title) {
        alert("Vui lòng nhập tên công việc.");
        return;
      }
      onAddTask({
        ...initialData, // Preserve ID if editing
        title: taskData.title,
        priority: taskData.priority as Priority,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
        assignee: taskData.assignee,
        completed: initialData?.completed || false
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header with Tabs */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 pb-0 md:p-5 md:pb-0 text-white flex flex-col flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
              {activeTab === 'event' ? <Calendar className="w-5 h-5" /> : 
               activeTab === 'document' ? <FileText className="w-5 h-5" /> : 
               <CheckSquare className="w-5 h-5" />}
              {initialData ? 'Cập nhật' : 'Thêm mới'} {activeTab === 'event' ? 'Sự kiện' : 
               activeTab === 'document' ? 'Văn bản' : 
               'Nhắc việc'}
            </h2>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs - Disable tabs if editing specific item */}
          <div className="flex gap-4 overflow-x-auto custom-scrollbar-x">
            <button
              onClick={() => !initialData && setActiveTab('event')}
              className={`pb-3 px-2 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'event' 
                  ? 'border-white text-white' 
                  : 'border-transparent text-indigo-200 hover:text-white'
              } ${initialData ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              Sự kiện lịch
            </button>
            <button
              onClick={() => !initialData && setActiveTab('task')}
              className={`pb-3 px-2 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'task' 
                  ? 'border-white text-white' 
                  : 'border-transparent text-indigo-200 hover:text-white'
              } ${initialData ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              Nhắc việc
            </button>
            <button
              onClick={() => !initialData && setActiveTab('document')}
              className={`pb-3 px-2 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'document' 
                  ? 'border-white text-white' 
                  : 'border-transparent text-indigo-200 hover:text-white'
              } ${initialData ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              Văn bản đến
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* --- EVENT FORM --- */}
            {activeTab === 'event' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề sự kiện *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={eventData.title}
                    onChange={handleEventChange}
                    placeholder="Ví dụ: Họp giao ban"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-base"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bắt đầu *</label>
                    <input
                        type="datetime-local"
                        name="start"
                        required
                        min={initialData ? undefined : currentDateTime} // Disable past dates only for new
                        value={eventData.start}
                        onChange={handleEventChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kết thúc *</label>
                    <input
                        type="datetime-local"
                        name="end"
                        required
                        min={eventData.start} // End cannot be before Start
                        value={eventData.end}
                        onChange={handleEventChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại sự kiện</label>
                    <select
                      name="type"
                      value={eventData.type}
                      onChange={handleEventChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-base"
                    >
                      {Object.values(EventType).map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
                    <div className="relative">
                        <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                            type="text"
                            name="location"
                            value={eventData.location}
                            onChange={handleEventChange}
                            placeholder="Phòng họp A"
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-base"
                        />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <div className="relative">
                    <AlignLeft className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <textarea
                        name="description"
                        value={eventData.description}
                        onChange={handleEventChange}
                        rows={3}
                        placeholder="Chi tiết nội dung..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none text-base"
                    />
                  </div>
                </div>
              </>
            )}

            {/* --- DOCUMENT FORM --- */}
            {activeTab === 'document' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số ký hiệu *</label>
                    <div className="relative">
                      <Hash className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        name="code"
                        required
                        value={docData.code}
                        onChange={handleDocChange}
                        placeholder="123/BC..."
                        className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-base"
                      />
                    </div>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Độ khẩn</label>
                    <div className="relative">
                      <AlertCircle className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <select
                        name="priority"
                        value={docData.priority}
                        onChange={handleDocChange}
                        className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-base"
                      >
                        {Object.values(Priority).map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trích yếu văn bản *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={docData.title}
                    onChange={handleDocChange}
                    placeholder="V/v báo cáo tình hình..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-base"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị trình</label>
                    <div className="relative">
                        <Building className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                            type="text"
                            name="submitter"
                            value={docData.submitter}
                            onChange={handleDocChange}
                            placeholder="Phòng KT-TC"
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-base"
                        />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hạn xử lý (Ngày & Giờ) *</label>
                    <input
                        type="datetime-local"
                        name="deadline"
                        required
                        min={initialData ? undefined : currentDateTime}
                        value={docData.deadline}
                        onChange={handleDocChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-base"
                    />
                  </div>
                </div>
              </>
            )}

            {/* --- TASK FORM --- */}
            {activeTab === 'task' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên công việc *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={taskData.title}
                    onChange={handleTaskChange}
                    placeholder="Ví dụ: Phê duyệt kế hoạch..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-base"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ ưu tiên</label>
                    <div className="relative">
                      <AlertCircle className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <select
                        name="priority"
                        value={taskData.priority}
                        onChange={handleTaskChange}
                        className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-base"
                      >
                        {Object.values(Priority).map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hạn hoàn thành</label>
                    <input
                        type="datetime-local"
                        name="dueDate"
                        min={initialData ? undefined : currentDateTime}
                        value={taskData.dueDate}
                        onChange={handleTaskChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Người thực hiện / Giao cho</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="assignee"
                      value={taskData.assignee}
                      onChange={handleTaskChange}
                      placeholder="Ví dụ: Trưởng phòng A"
                      className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-base"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors text-sm md:text-base"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all text-sm md:text-base"
              >
                {initialData ? 'Cập nhật' : 'Lưu'} {activeTab === 'event' ? 'sự kiện' : activeTab === 'document' ? 'văn bản' : 'công việc'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};