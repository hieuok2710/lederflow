import React, { useState, useEffect, useRef } from 'react';
import { CalendarEvent, ViewMode, EventType, EventColorMapping } from '../types';
import { getStartOfWeek, addDays, isSameDay, formatTime, getEventTypeColor, COLOR_PALETTES } from '../utils';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, Settings, X, Palette, Plus, Edit2 } from 'lucide-react';

interface CalendarProps {
  events: CalendarEvent[];
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  eventColors: EventColorMapping;
  onColorChange: (type: EventType, color: string) => void;
  onAddEventClick: () => void;
  onEditEvent: (event: CalendarEvent) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ events, mode, onModeChange, eventColors, onColorChange, onAddEventClick, onEditEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Constants for Timeline View
  const HOUR_HEIGHT = 60; // px per hour
  const START_HOUR = 0;
  const END_HOUR = 24;

  // Auto-scroll to 7 AM on mount or mode switch
  useEffect(() => {
    if (mode === ViewMode.CALENDAR_WEEK && scrollContainerRef.current) {
      // Scroll to 07:00
      scrollContainerRef.current.scrollTop = 7 * HOUR_HEIGHT;
    }
  }, [mode]);

  const handlePrev = () => {
    setCurrentDate(prev => addDays(prev, mode === ViewMode.CALENDAR_WEEK ? -7 : -30));
  };

  const handleNext = () => {
    setCurrentDate(prev => addDays(prev, mode === ViewMode.CALENDAR_WEEK ? 7 : 30));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getDays = () => {
    if (mode === ViewMode.CALENDAR_WEEK) {
      const start = getStartOfWeek(currentDate);
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    } else {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDayOfMonth = new Date(year, month, 1);
      const start = getStartOfWeek(firstDayOfMonth);
      return Array.from({ length: 42 }, (_, i) => addDays(start, i));
    }
  };

  // Helper to check if a date is in the past (before today)
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const days = getDays();
  const weekDaysHeader = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);

  // --- TIMELINE LOGIC ---
  const getEventPosition = (event: CalendarEvent) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    
    const startHour = start.getHours();
    const startMin = start.getMinutes();
    
    const top = (startHour * 60 + startMin) * (HOUR_HEIGHT / 60);
    let durationMin = (end.getTime() - start.getTime()) / (1000 * 60);
    
    // Safety check for negative duration if user inputs End < Start
    if (durationMin < 0) durationMin = 30;
    
    // Min height 30 mins visual
    if (durationMin < 30) durationMin = 30;
    
    const height = durationMin * (HOUR_HEIGHT / 60);

    return { top, height };
  };

  const renderTimelineEvents = (date: Date) => {
    const dayEvents = events.filter(e => isSameDay(new Date(e.start), date));
    
    // Sort by start time, then duration (longest first)
    dayEvents.sort((a, b) => {
      const startDiff = new Date(a.start).getTime() - new Date(b.start).getTime();
      if (startDiff !== 0) return startDiff;
      return (new Date(b.end).getTime() - new Date(b.start).getTime()) - (new Date(a.end).getTime() - new Date(a.start).getTime());
    });

    // Calculate overlap groups for cascading layout
    const processedEvents = dayEvents.map(event => {
       // Find how many previous events overlap with this one
       const overlaps = dayEvents.filter(other => 
         other !== event && 
         new Date(other.start) < new Date(event.start) && 
         new Date(other.end) > new Date(event.start)
       );
       
       const overlapLevel = overlaps.length;
       const { top, height } = getEventPosition(event);

       // Indent based on overlap level
       const left = overlapLevel * 10; // 10% shift per level
       const width = 100 - left; // Rest of width

       return { event, top, height, left, width, zIndex: 10 + overlapLevel };
    });

    return processedEvents.map(({ event, top, height, left, width, zIndex }) => (
      <div
        key={event.id}
        className={`absolute rounded-md border-l-4 p-1 md:p-2 text-xs shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden ${getEventTypeColor(event.type, eventColors)}`}
        style={{
          top: `${top}px`,
          height: `${height}px`,
          left: `${left}%`,
          width: `${width}%`,
          zIndex: zIndex,
          borderTop: '1px solid rgba(0,0,0,0.05)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          borderRight: '1px solid rgba(0,0,0,0.05)',
        }}
        onClick={() => onEditEvent(event)}
      >
        <div className="flex flex-col h-full relative pr-5">
          <div className="flex items-center gap-1 font-bold truncate text-gray-800">
            <span className="text-[10px] opacity-75">{formatTime(new Date(event.start))}</span>
            <span className="truncate">{event.title}</span>
          </div>
          {height > 40 && event.location && (
            <div className="mt-0.5 text-[10px] opacity-80 truncate flex items-center gap-1">
               📍 {event.location}
            </div>
          )}
          
          {/* Edit Button for Week View */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEditEvent(event);
            }}
            className="absolute top-1 right-1 p-1 bg-white/50 hover:bg-white rounded text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center"
            title="Chỉnh sửa"
          >
            <Edit2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    ));
  };

  const renderMonthEvents = (date: Date) => {
      const dayEvents = events.filter(e => isSameDay(new Date(e.start), date));
      dayEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

      const MAX_VISIBLE = 3;
      const visibleEvents = dayEvents.slice(0, MAX_VISIBLE);
      const remaining = dayEvents.length - MAX_VISIBLE;

      return (
        <div className="flex flex-col gap-1 mt-1">
          {visibleEvents.map(e => (
            <div 
              key={e.id} 
              className={`group relative px-1.5 py-0.5 rounded text-[10px] truncate border-l-2 leading-tight ${getEventTypeColor(e.type, eventColors)} hover:brightness-95 cursor-pointer transition-colors pr-6`}
              title={`${formatTime(new Date(e.start))} - ${e.title}`}
              onClick={() => onEditEvent(e)}
            >
              <span className="font-semibold mr-1 hidden xl:inline">{formatTime(new Date(e.start))}</span>
              <span className="truncate">{e.title}</span>
              
              {/* Edit Button for Month View */}
              <button 
                onClick={(ev) => {
                  ev.stopPropagation();
                  onEditEvent(e);
                }}
                className="absolute right-0.5 top-0.5 bottom-0.5 px-1 bg-white/30 hover:bg-white/60 rounded hidden group-hover:flex items-center justify-center transition-all"
                title="Sửa"
              >
                <Edit2 className="w-2.5 h-2.5 text-gray-800" />
              </button>
            </div>
          ))}
          {remaining > 0 && (
            <div className="text-[10px] text-gray-500 font-medium pl-1">
              +{remaining} nữa
            </div>
          )}
        </div>
      );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-9rem)] overflow-hidden transition-all relative">
      
      {/* Color Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Palette className="w-4 h-4" /> Cài đặt màu sắc
                    </h3>
                    <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4 space-y-4">
                    {Object.values(EventType).map(type => (
                        <div key={type} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{type}</span>
                            <div className="flex gap-2">
                                {[COLOR_PALETTES.blue, COLOR_PALETTES.red, COLOR_PALETTES.green, COLOR_PALETTES.amber, COLOR_PALETTES.purple, COLOR_PALETTES.slate].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => onColorChange(type, color)}
                                        className={`w-5 h-5 rounded-full border border-gray-200 ${color.split(' ')[0]} ${eventColors[type] === color ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                    <button onClick={() => setShowSettings(false)} className="text-sm text-indigo-600 font-medium hover:underline">
                        Đóng cài đặt
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-3 lg:p-4 border-b border-gray-200 flex-shrink-0 bg-white z-10">
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 md:p-1">
            <button 
              onClick={() => onModeChange(ViewMode.CALENDAR_WEEK)}
              className={`px-2 md:px-3 py-1 md:py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${mode === ViewMode.CALENDAR_WEEK ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Tuần
            </button>
            <button 
              onClick={() => onModeChange(ViewMode.CALENDAR_MONTH)}
              className={`px-2 md:px-3 py-1 md:py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${mode === ViewMode.CALENDAR_MONTH ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Tháng
            </button>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2">
            <button onClick={handlePrev} className="p-1 md:p-1.5 hover:bg-gray-100 rounded-full text-gray-600">
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button onClick={handleToday} className="px-2 md:px-3 py-1 text-xs md:text-sm font-medium hover:bg-gray-100 rounded-lg text-gray-700">
              Hôm nay
            </button>
            <button onClick={handleNext} className="p-1 md:p-1.5 hover:bg-gray-100 rounded-full text-gray-600">
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          <h2 className="text-sm md:text-lg font-bold text-gray-800 min-w-[100px] truncate">
            Tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}
          </h2>
        </div>

        <div className="flex items-center gap-2">
            <button 
                onClick={onAddEventClick}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs md:text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
            >
                <Plus className="w-4 h-4" />
                Thêm sự kiện
            </button>
            <button 
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                title="Cài đặt màu sắc"
            >
                <Settings className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Week View (Timeline) */}
      {mode === ViewMode.CALENDAR_WEEK && (
        <div className="flex-1 overflow-auto flex flex-col relative" ref={scrollContainerRef}>
          {/* Days Header (Sticky) */}
          <div className="grid grid-cols-[50px_1fr] sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
            <div className="p-2 border-r border-gray-100 bg-gray-50/50"></div> {/* Corner */}
            <div className="grid grid-cols-7 min-w-[800px]">
              {days.map((day, i) => {
                const isToday = isSameDay(day, new Date());
                const isPast = isPastDate(day);
                return (
                  <div key={i} className={`p-2 text-center border-r border-gray-100 last:border-r-0 ${isToday ? 'bg-indigo-50/50' : ''} ${isPast ? 'bg-gray-50/30' : ''}`}>
                    <p className={`text-[10px] uppercase font-bold tracking-wider mb-0.5 ${isToday ? 'text-indigo-600' : 'text-gray-400'}`}>
                      {weekDaysHeader[day.getDay() === 0 ? 6 : day.getDay() - 1]}
                    </p>
                    <div className={`mx-auto w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full text-sm md:text-base font-bold ${isToday ? 'bg-indigo-600 text-white shadow-md' : isPast ? 'text-gray-400' : 'text-gray-800'}`}>
                      {day.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline Grid */}
          <div className="grid grid-cols-[50px_1fr] flex-1 pb-8">
             {/* Time Column */}
             <div className="border-r border-gray-100 bg-gray-50/30">
               {hours.map((hour) => (
                 <div key={hour} className="relative text-right pr-2 text-xs text-gray-400 font-medium" style={{ height: `${HOUR_HEIGHT}px` }}>
                   <span className="absolute -top-2 right-2 bg-white px-1 z-10">
                     {hour}:00
                   </span>
                 </div>
               ))}
               {/* 24:00 Marker */}
               <div className="relative text-right pr-2 text-xs text-gray-400 font-medium">
                  <span className="absolute -top-2 right-2 bg-white px-1 z-10">
                     24:00
                   </span>
               </div>
             </div>

             {/* Events Columns */}
             <div className="grid grid-cols-7 relative min-w-[800px]">
                {/* Horizontal Grid Lines */}
                {hours.map((hour) => (
                    <div key={hour} className="absolute w-full border-t border-gray-100 border-dashed pointer-events-none" style={{ top: `${hour * HOUR_HEIGHT}px` }}></div>
                ))}
                {/* Bottom Border for 24:00 */}
                <div className="absolute w-full border-t border-gray-100 border-dashed pointer-events-none" style={{ top: `${24 * HOUR_HEIGHT}px` }}></div>
                
                {/* Day Columns */}
                {days.map((day, i) => {
                   const isPast = isPastDate(day);
                   return (
                    <div key={i} className={`relative border-r border-gray-100 last:border-r-0 h-full min-h-[1440px] ${isPast ? 'bg-gray-50/30' : ''}`}>
                        {renderTimelineEvents(day)}
                    </div>
                   );
                })}
             </div>
          </div>
        </div>
      )}

      {/* Month View */}
      {mode === ViewMode.CALENDAR_MONTH && (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-7 h-full min-h-[600px] border-l border-t border-gray-200 bg-gray-200 gap-px">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
              <div key={day} className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                {day}
              </div>
            ))}
            
            {days.map((day, i) => {
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isPast = isPastDate(day);
              
              return (
                <div 
                  key={i} 
                  className={`bg-white p-1 md:p-2 min-h-[100px] flex flex-col hover:bg-gray-50 transition-colors ${!isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : ''} ${isPast ? 'bg-gray-50/20' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${isToday ? 'bg-indigo-600 text-white' : ''}`}>
                      {day.getDate()}
                    </span>
                  </div>
                  {renderMonthEvents(day)}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};