import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Briefcase, ArrowRight, Lock, User as UserIcon, UserPlus, LogIn, Eye, EyeOff, Calendar, CheckSquare, FileText, Bell } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

// Interface for user data stored in "Database" (LocalStorage) including password
interface StoredUser extends User {
  password?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Initialize Default Admin on Mount
  useEffect(() => {
    const existingUsersStr = localStorage.getItem('leaderflow_users_db');
    let existingUsers: StoredUser[] = existingUsersStr ? JSON.parse(existingUsersStr) : [];

    // Check specifically for 'admin' user
    const adminExists = existingUsers.some(u => u.username === 'admin');

    if (!adminExists) {
      const defaultAdmin: StoredUser = {
        id: 'admin_master',
        username: 'admin',
        password: 'admin##',
        fullName: 'Quản trị viên Hệ thống',
        role: 'Admin'
      };
      existingUsers.push(defaultAdmin);
      localStorage.setItem('leaderflow_users_db', JSON.stringify(existingUsers));
      console.log('Default admin account (admin/admin##) created.');
    }
  }, []);

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccessMsg('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Validation
    if (!username.trim() || !password || !confirmPassword || !fullName.trim()) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (/\s/.test(username)) {
      setError('Tên đăng nhập không được chứa khoảng trắng.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự.');
        return;
    }

    // Load existing users
    const existingUsersStr = localStorage.getItem('leaderflow_users_db');
    const existingUsers: StoredUser[] = existingUsersStr ? JSON.parse(existingUsersStr) : [];

    // Check duplicate
    if (existingUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      setError('Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.');
      return;
    }

    // Create new user
    const newUser: StoredUser = {
      id: username.toLowerCase(),
      username: username,
      fullName: fullName,
      role: 'Lãnh đạo', // Default role for self-registration
      password: password 
    };

    // Save to DB
    const updatedUsers = [...existingUsers, newUser];
    localStorage.setItem('leaderflow_users_db', JSON.stringify(updatedUsers));

    setSuccessMsg('Đăng ký thành công! Vui lòng đăng nhập.');
    setIsRegistering(false); // Switch back to login
    setUsername(newUser.username); // Pre-fill username
    setPassword('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu.');
      return;
    }

    // Load users from DB
    const existingUsersStr = localStorage.getItem('leaderflow_users_db');
    const existingUsers: StoredUser[] = existingUsersStr ? JSON.parse(existingUsersStr) : [];

    // Find user
    const user = existingUsers.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (user) {
      // Remove password before passing to session
      const { password, ...safeUser } = user;
      onLogin(safeUser as User);
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không chính xác.');
    }
  };

  const FeatureItem = ({ icon: Icon, title, desc, colorClass }: { icon: any, title: string, desc: string, colorClass: string }) => (
    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/50 flex items-start gap-3 hover:shadow-md transition-shadow">
      <div className={`p-2 rounded-lg ${colorClass} text-white`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
        <p className="text-xs text-gray-600 mt-0.5">{desc}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
        
        {/* LEFT SIDE: BANNER (Parallel Layout) */}
        <div className="w-full lg:w-5/12 bg-indigo-50 p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-indigo-900 tracking-tight">LeaderFlow</span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    Ứng dụng Quản lý <br/>
                    <span className="text-indigo-600">Công việc & Văn bản</span>
                </h1>
                <p className="text-gray-600 mb-8 text-sm leading-relaxed">
                    Hệ thống toàn diện giúp lãnh đạo quản lý lịch trình, theo dõi tiến độ công việc và xử lý văn bản mọi lúc, mọi nơi.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FeatureItem 
                        icon={Calendar} 
                        title="Lịch tuần & tháng" 
                        desc="Xem toàn cảnh công việc" 
                        colorClass="bg-blue-500"
                    />
                    <FeatureItem 
                        icon={CheckSquare} 
                        title="Quản lý công việc" 
                        desc="Theo dõi tiến độ dễ dàng" 
                        colorClass="bg-green-500"
                    />
                    <FeatureItem 
                        icon={FileText} 
                        title="Quản lý văn bản" 
                        desc="Tổ chức tài liệu hiệu quả" 
                        colorClass="bg-orange-500"
                    />
                    <FeatureItem 
                        icon={Bell} 
                        title="Nhắc nhở đúng hạn" 
                        desc="Không bỏ lỡ deadline" 
                        colorClass="bg-indigo-500"
                    />
                </div>
            </div>
        </div>

        {/* RIGHT SIDE: LOGIN FORM */}
        <div className="w-full lg:w-7/12 p-8 lg:p-16 flex flex-col justify-center bg-white relative">
            <div className="max-w-md mx-auto w-full">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {isRegistering ? 'Đăng ký tài khoản' : 'Chào mừng trở lại!'}
                    </h2>
                    <p className="text-gray-500 text-sm">
                        {isRegistering ? 'Nhập thông tin để tạo tài khoản mới' : 'Vui lòng đăng nhập để truy cập hệ thống'}
                    </p>
                </div>

                <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-5">
                    
                    {/* Notifications area */}
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> {error}
                        </div>
                    )}
                    {successMsg && (
                        <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100 flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> {successMsg}
                        </div>
                    )}

                    {/* Full Name (Register Only) */}
                    {isRegistering && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và tên</label>
                            <div className="relative group">
                                <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Nguyễn Văn A"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                />
                            </div>
                        </div>
                    )}

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên đăng nhập</label>
                        <div className="relative group">
                            <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Nhập tên đăng nhập"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all bg-gray-50 focus:bg-white"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu</label>
                        <div className="relative group">
                            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all bg-gray-50 focus:bg-white"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 p-0.5 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password (Register Only) */}
                    {isRegistering && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Xác nhận mật khẩu</label>
                            <div className="relative group">
                                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                        >
                            {isRegistering ? (
                                <>
                                    <UserPlus className="w-5 h-5" /> Đăng ký ngay
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" /> Đăng nhập
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        {isRegistering ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
                        <button 
                            onClick={toggleMode}
                            className="ml-1.5 text-indigo-600 font-bold hover:text-indigo-800 hover:underline transition-colors"
                        >
                            {isRegistering ? 'Đăng nhập ngay' : 'Đăng ký miễn phí'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
