import React from 'react';
import { CalendarEvent, Task, Priority, Document, DocumentStatus, EventColorMapping } from '../types';
import { formatDate, formatTime, getPriorityColor, getEventTypeColor, getDocumentStatusColor, getRelativeTimeLabel, isOverdue } from '../utils';
import { CheckCircle2, AlertCircle, FileText, ArrowRight, Briefcase, Calendar, Clock, Plus } from 'lucide-react';

interface DashboardProps {
  events: CalendarEvent[];
  tasks: Task[];
  documents: Document[];
  eventColors: EventColorMapping;
  onTaskToggle: (id: string) => void;
  onViewAllDocuments: () => void;
  onAddTaskClick: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ events, tasks, documents, eventColors, onTaskToggle, onViewAllDocuments, onAddTaskClick }) => {
  // Filter today's items
  const today = new Date();
  const todayEvents = events.filter(e => 
    new Date(e.start).toDateString() === today.toDateString()
  ).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  
  const urgentTasks = tasks
    .filter(t => !t.completed && (t.priority === Priority.URGENT || t.priority === Priority.HIGH))
    .sort((a, b) => {
      // Sort by Due Date (Nearest first), then items without date
      if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
  
  // Filter pending documents sorted by deadline
  const pendingDocs = documents
    .filter(d => d.status === DocumentStatus.PENDING || d.status === DocumentStatus.IN_PROGRESS || d.status === DocumentStatus.OVERDUE)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3); // Show top 3

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Welcome Banner - Compact on Mobile */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-xl p-4 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 hidden md:block">
          <Briefcase className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="mb-4">
            <h1 className="text-xl md:text-3xl font-bold">Xin chào, Lãnh đạo</h1>
            <p className="text-indigo-100 text-xs md:text-lg">{formatDate(today)}</p>
          </div>
          
          {/* Stats Grid - Horizontal on mobile now */}
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-white/20 text-center md:text-left">
              <p className="text-[10px] md:text-xs text-indigo-200 uppercase tracking-wider font-semibold truncate">Lịch hôm nay</p>
              <p className="text-lg md:text-2xl font-bold">{todayEvents.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-white/20 text-center md:text-left">
              <p className="text-[10px] md:text-xs text-indigo-200 uppercase tracking-wider font-semibold truncate">Việc gấp</p>
              <p className="text-lg md:text-2xl font-bold">{urgentTasks.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-white/20 text-center md:text-left">
              <p className="text-[10px] md:text-xs text-indigo-200 uppercase tracking-wider font-semibold truncate">Văn bản chờ</p>
              <p className="text-lg md:text-2xl font-bold">{pendingDocs.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column: Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              Lịch trình hôm nay
            </h2>
            <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              {todayEvents.length}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {todayEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-6 text-sm">Hôm nay không có lịch trình.</p>
            ) : (
              todayEvents.map((event) => (
                <div key={event.id} className="flex gap-3 group">
                  <div className="w-12 md:w-16 flex-shrink-0 flex flex-col items-center justify-start pt-1">
                    <span className="text-xs md:text-sm font-bold text-gray-900">{formatTime(new Date(event.start))}</span>
                    <div className="h-full w-0.5 bg-gray-100 mt-1 md:mt-2 group-last:hidden"></div>
                  </div>
                  <div className={`flex-1 p-2 md:p-4 rounded-lg border-l-4 ${getEventTypeColor(event.type, eventColors).replace('text-', 'border-').split(' ')[2]} bg-white shadow-sm border border-gray-100`}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate">{event.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap ${getEventTypeColor(event.type, eventColors)}`}>
                            {event.type}
                          </span>
                          {event.location && (
                            <span className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1 truncate">
                              📍 {event.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Action Center (Documents + Tasks) */}
        <div className="space-y-4 md:space-y-6">
            
          {/* Documents Widget */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base md:text-lg font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
                Văn bản đến hạn
              </h2>
              <button onClick={onViewAllDocuments} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center">
                Xem <ArrowRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>
            
            <div className="space-y-2">
              {pendingDocs.length === 0 ? (
                 <div className="text-center py-4 text-xs text-gray-500">Không có văn bản gấp.</div>
              ) : (
                pendingDocs.map(doc => (
                  <div key={doc.id} className="p-2 md:p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="flex justify-between items-start mb-1 gap-2">
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded truncate max-w-[80px]">{doc.code}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border whitespace-nowrap ${getDocumentStatusColor(doc.status)}`}>{doc.status}</span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-800 font-medium line-clamp-2 leading-snug" title={doc.title}>{doc.title}</p>
                    <div className="mt-1.5 text-[10px] text-amber-700 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Hạn: {formatTime(new Date(doc.deadline))} - {formatDate(new Date(doc.deadline))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Priority Tasks Widget */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base md:text-lg font-bold text-gray-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                Việc gấp
              </h2>
              <button 
                 onClick={onAddTaskClick}
                 className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                 title="Thêm nhanh việc gấp"
              >
                 <Plus className="w-3.5 h-3.5" /> Thêm
              </button>
            </div>

            <div className="space-y-2">
              {urgentTasks.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-xs">
                  <CheckCircle2 className="w-6 h-6 text-green-200 mx-auto mb-1" />
                  <p>Sạch việc quan trọng</p>
                </div>
              ) : (
                urgentTasks.map(task => {
                  const overdue = task.dueDate && isOverdue(new Date(task.dueDate));
                  return (
                    <div key={task.id} className="flex items-start gap-2 md:gap-3 p-2 md:p-3 rounded-lg border border-gray-100 bg-white">
                      <button 
                        onClick={() => onTaskToggle(task.id)}
                        className="mt-0.5 w-3.5 h-3.5 md:w-4 md:h-4 rounded border-2 border-gray-300 flex items-center justify-center flex-shrink-0"
                      >
                        <div className="w-2 h-2 rounded-sm bg-blue-500 opacity-0" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-medium text-gray-800 leading-snug truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          {task.dueDate && (
                            <span className={`text-[10px] ${overdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                              {getRelativeTimeLabel(new Date(task.dueDate))}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};