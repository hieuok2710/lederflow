import React from 'react';
import { Task, Priority } from '../types';
import { getPriorityColor, formatDate, getRelativeTimeLabel, isOverdue } from '../utils';
import { CheckSquare, Square, Clock, Plus } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onAddTaskClick: () => void;
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle }) => {
  const isTaskOverdue = task.dueDate && isOverdue(new Date(task.dueDate)) && !task.completed;
  
  return (
    <div className={`group flex items-center gap-3 p-3 bg-white rounded-lg border hover:shadow-md transition-all ${task.completed ? 'border-gray-100 opacity-60' : isTaskOverdue ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}`}>
      <button 
        onClick={() => onToggle(task.id)}
        className={`w-5 h-5 md:w-6 md:h-6 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 text-transparent hover:border-blue-500'}`}
      >
        <CheckSquare className="w-3 h-3 md:w-4 md:h-4" />
      </button>
      
      <div className="flex-1 min-w-0">
        <h3 className={`text-sm md:text-base font-medium truncate ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
          {task.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          {task.dueDate && (
            <span className={`flex items-center gap-1 text-[10px] md:text-xs ${isTaskOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
              <Clock className="w-3 h-3" />
              {getRelativeTimeLabel(new Date(task.dueDate))}
            </span>
          )}
          {task.assignee && (
            <span className="text-[10px] md:text-xs text-gray-500 truncate max-w-[100px]">
              Giao: {task.assignee}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const TaskList: React.FC<TaskListProps> = ({ tasks, onToggle, onAddTaskClick }) => {
  // Sort tasks: Due Date (asc) -> Priority (desc) -> Creation (implicit)
  const pendingTasks = tasks
    .filter(t => !t.completed)
    .sort((a, b) => {
      // 1. Due date check
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1; // Tasks with date come first
      if (b.dueDate) return 1;

      // 2. Priority check (for tasks without date or same date)
      const pScore = { [Priority.URGENT]: 3, [Priority.HIGH]: 2, [Priority.NORMAL]: 1, [Priority.LOW]: 0 };
      return pScore[b.priority] - pScore[a.priority];
    });

  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Square className="w-5 h-5 text-indigo-600" />
            Quản lý công việc
          </h2>
          <button 
             onClick={onAddTaskClick}
             className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs md:text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
          >
             <Plus className="w-4 h-4" />
             Thêm công việc
          </button>
      </div>

      <div>
        <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2 px-1">
          <Clock className="w-5 h-5 text-amber-600" />
          Cần xử lý ({pendingTasks.length})
        </h2>
        <div className="space-y-2 md:space-y-3">
          {pendingTasks.map(task => <TaskItem key={task.id} task={task} onToggle={onToggle} />)}
          {pendingTasks.length === 0 && (
            <div className="text-center py-8 text-sm text-gray-500 bg-white rounded-lg border border-gray-100 border-dashed">
                Tuyệt vời! Bạn đã hoàn thành hết công việc.
            </div>
          )}
        </div>
      </div>

      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-base md:text-lg font-semibold text-gray-500 mb-3 md:mb-4 flex items-center gap-2 px-1">
            <CheckSquare className="w-5 h-5" />
            Đã hoàn thành ({completedTasks.length})
          </h2>
          <div className="space-y-2 md:space-y-3">
            {completedTasks.map(task => <TaskItem key={task.id} task={task} onToggle={onToggle} />)}
          </div>
        </div>
      )}
    </div>
  );
};