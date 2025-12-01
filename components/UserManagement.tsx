import React, { useState } from 'react';
import { User } from '../types';
import { Users, Plus, Edit2, Trash2, X, Shield, ShieldCheck, Key, RefreshCw } from 'lucide-react';

interface StoredUser extends User {
  password?: string;
}

interface UserManagementProps {
  users: StoredUser[];
  onAddUser: (user: StoredUser) => void;
  onEditUser: (user: StoredUser) => void;
  onDeleteUser: (userId: string) => void;
  currentUser: User;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser, onEditUser, onDeleteUser, currentUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<StoredUser | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    password: '',
    role: 'Lãnh đạo'
  });

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ username: '', fullName: '', password: '', role: 'Lãnh đạo' });
    setShowModal(true);
  };

  const openEditModal = (user: StoredUser) => {
    setEditingUser(user);
    setFormData({ 
      username: user.username, 
      fullName: user.fullName, 
      password: '', // Don't show existing password
      role: user.role 
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.fullName) {
      alert("Vui lòng điền tên đăng nhập và họ tên.");
      return;
    }

    if (editingUser) {
      // Edit mode
      const updatedUser: StoredUser = {
        ...editingUser,
        fullName: formData.fullName,
        role: formData.role
      };
      // Only update password if provided
      if (formData.password) {
        updatedUser.password = formData.password;
        alert(`Đã cập nhật thông tin và reset mật khẩu cho tài khoản ${updatedUser.username}.`);
      } else {
        alert(`Đã cập nhật thông tin tài khoản ${updatedUser.username}.`);
      }
      onEditUser(updatedUser);
    } else {
      // Add mode
      if (!formData.password) {
        alert("Vui lòng nhập mật khẩu cho tài khoản mới.");
        return;
      }
      // Check duplicate
      if (users.some(u => u.username === formData.username)) {
         alert("Tên đăng nhập đã tồn tại.");
         return;
      }

      const newUser: StoredUser = {
        id: formData.username,
        username: formData.username,
        fullName: formData.fullName,
        password: formData.password,
        role: formData.role
      };
      onAddUser(newUser);
    }
    setShowModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-indigo-600" />
            Quản trị tài khoản người dùng
          </h2>
          
          <button 
             onClick={openAddModal}
             className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
          >
             <Plus className="w-4 h-4" />
             Thêm tài khoản
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Tên đăng nhập</th>
                <th className="px-6 py-4">Họ và tên</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 text-gray-700">{user.fullName}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'Admin' 
                        ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                        {user.role === 'Admin' ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                        {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(user)}
                        className="flex items-center gap-1 px-2 py-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors text-xs font-medium"
                        title="Sửa & Reset Mật khẩu"
                      >
                        <Edit2 className="w-3 h-3" /> Sửa/Reset
                      </button>
                      
                      {user.id !== currentUser.id && user.username !== 'admin' && (
                        <button 
                          onClick={() => {
                              if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản ${user.username}? Dữ liệu của tài khoản này sẽ không thể khôi phục.`)) {
                                  onDeleteUser(user.id);
                              }
                          }}
                          className="flex items-center gap-1 px-2 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors text-xs font-medium"
                          title="Xóa tài khoản"
                        >
                          <Trash2 className="w-3 h-3" /> Xóa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        {editingUser ? <Edit2 className="w-5 h-5"/> : <Plus className="w-5 h-5"/>}
                        {editingUser ? 'Cập nhật tài khoản' : 'Thêm tài khoản mới'}
                    </h3>
                    <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={e => setFormData({...formData, username: e.target.value})}
                            disabled={!!editingUser}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg outline-none ${editingUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-indigo-500'}`}
                        />
                        {editingUser && <p className="text-xs text-gray-500 mt-1">Không thể thay đổi tên đăng nhập.</p>}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={e => setFormData({...formData, fullName: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <label className="block text-sm font-bold text-gray-800 mb-1 flex items-center gap-2">
                            <Key className="w-4 h-4 text-indigo-600" />
                            {editingUser ? 'Reset Mật khẩu' : 'Thiết lập Mật khẩu'}
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                            {editingUser ? 'Nhập mật khẩu mới để reset. Để trống nếu giữ nguyên mật khẩu cũ.' : 'Nhập mật khẩu cho tài khoản mới.'}
                        </p>
                        <input
                            type="text"
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            placeholder={editingUser ? "Nhập mật khẩu mới..." : "Nhập mật khẩu..."}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                        <select
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        >
                            <option value="Lãnh đạo">Lãnh đạo</option>
                            <option value="Admin">Admin (Quản trị)</option>
                            <option value="Nhân viên">Nhân viên</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md">
                            {editingUser ? 'Cập nhật' : 'Tạo mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};