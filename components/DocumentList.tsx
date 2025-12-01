import React from 'react';
import { Document, DocumentStatus, Priority } from '../types';
import { formatDate, formatTime, getDocumentStatusColor, getPriorityColor } from '../utils';
import { FileText, AlertTriangle, CheckCircle, Clock, ArrowRight, MoreHorizontal, Plus } from 'lucide-react';

interface DocumentListProps {
  documents: Document[];
  onUpdateStatus: (id: string, newStatus: DocumentStatus) => void;
  onAddDocumentClick: () => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, onUpdateStatus, onAddDocumentClick }) => {
  // Sort: Overdue first, then by deadline
  const sortedDocs = [...documents].sort((a, b) => {
    if (a.status === DocumentStatus.OVERDUE && b.status !== DocumentStatus.OVERDUE) return -1;
    if (a.status !== DocumentStatus.OVERDUE && b.status === DocumentStatus.OVERDUE) return 1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  const renderStatusBadge = (status: DocumentStatus) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDocumentStatusColor(status)}`}>
      {status}
    </span>
  );

  const renderPriorityBadge = (priority: Priority) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${getPriorityColor(priority)}`}>
      {priority}
    </span>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Stats Cards - Grid optimized for mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-red-50 p-3 md:p-4 rounded-xl border border-red-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" />
            <span className="font-medium text-xs md:text-sm">Quá hạn</span>
          </div>
          <span className="text-xl md:text-2xl font-bold text-gray-800">
            {documents.filter(d => d.status === DocumentStatus.OVERDUE).length}
          </span>
        </div>
        <div className="bg-yellow-50 p-3 md:p-4 rounded-xl border border-yellow-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-yellow-600 mb-1">
            <Clock className="w-4 h-4 md:w-5 md:h-5" />
            <span className="font-medium text-xs md:text-sm">Chờ xử lý</span>
          </div>
          <span className="text-xl md:text-2xl font-bold text-gray-800">
            {documents.filter(d => d.status === DocumentStatus.PENDING).length}
          </span>
        </div>
        <div className="bg-blue-50 p-3 md:p-4 rounded-xl border border-blue-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <FileText className="w-4 h-4 md:w-5 md:h-5" />
            <span className="font-medium text-xs md:text-sm">Đang xử lý</span>
          </div>
          <span className="text-xl md:text-2xl font-bold text-gray-800">
            {documents.filter(d => d.status === DocumentStatus.IN_PROGRESS).length}
          </span>
        </div>
        <div className="bg-green-50 p-3 md:p-4 rounded-xl border border-green-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
            <span className="font-medium text-xs md:text-sm">Đã xong</span>
          </div>
          <span className="text-xl md:text-2xl font-bold text-gray-800">
            {documents.filter(d => d.status === DocumentStatus.COMPLETED).length}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 text-sm md:text-base">
            <FileText className="w-5 h-5 text-indigo-600" />
            Danh sách văn bản
          </h2>
          
          <button 
             onClick={onAddDocumentClick}
             className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs md:text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
          >
             <Plus className="w-4 h-4" />
             Thêm văn bản
          </button>
        </div>
        
        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {sortedDocs.map((doc) => (
            <div key={doc.id} className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md w-fit">
                    {doc.code}
                  </span>
                  <h3 className="font-semibold text-gray-900 leading-snug text-sm">{doc.title}</h3>
                </div>
                {renderStatusBadge(doc.status)}
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{doc.submitter}</span>
                <div className="flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3" />
                  {formatTime(new Date(doc.deadline))} - {formatDate(new Date(doc.deadline))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-1">
                {renderPriorityBadge(doc.priority)}
                
                {doc.status !== DocumentStatus.COMPLETED && (
                  <button 
                    onClick={() => onUpdateStatus(doc.id, DocumentStatus.COMPLETED)}
                    className="text-indigo-600 font-medium text-xs flex items-center gap-1 active:bg-indigo-50 px-2 py-1 rounded transition-colors"
                  >
                    Ký duyệt ngay <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {sortedDocs.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-sm">
              Không có văn bản nào.
            </div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Số ký hiệu</th>
                <th className="px-6 py-4">Trích yếu</th>
                <th className="px-6 py-4">Đơn vị trình</th>
                <th className="px-6 py-4">Độ khẩn</th>
                <th className="px-6 py-4">Hạn xử lý</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap text-sm">
                    {doc.code}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 line-clamp-2 max-w-xs" title={doc.title}>
                      {doc.title}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {doc.submitter}
                  </td>
                  <td className="px-6 py-4">
                     {renderPriorityBadge(doc.priority)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-medium">{formatTime(new Date(doc.deadline))}</span>
                      <span>- {formatDate(new Date(doc.deadline)).split(',')[1]}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {renderStatusBadge(doc.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {doc.status !== DocumentStatus.COMPLETED && (
                        <button 
                            onClick={() => onUpdateStatus(doc.id, DocumentStatus.COMPLETED)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium hover:underline flex items-center justify-end gap-1 w-full"
                        >
                            Ký duyệt <ArrowRight className="w-3 h-3" />
                        </button>
                    )}
                  </td>
                </tr>
              ))}
              {sortedDocs.length === 0 && (
                <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Không có văn bản nào.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};