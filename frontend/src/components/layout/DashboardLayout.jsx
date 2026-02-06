import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, FaHistory, FaUser, FaSignOutAlt, FaBars, FaTimes, 
  FaHeadset, FaBell, FaCircle, FaCoins, FaKey 
} from 'react-icons/fa';
import client from '../../api/client';
import { toast } from 'react-toastify';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: 'کاربر', role: 'user', tokens: 0 });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifBox, setShowNotifBox] = useState(false);

  // 1. دریافت اطلاعات کاربر و نوتیفیکیشن‌ها
  useEffect(() => {
    const loadData = async () => {
      try {
        // اطلاعات کاربر از لوکال استوریج
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          
          // اجبار به تغییر رمز
          if (parsed.mustChangePassword && location.pathname !== '/dashboard/change-password') {
            navigate('/dashboard/change-password');
          }
        }
        
        // دریافت نوتیفیکیشن‌ها از سرور
        const res = await client.get('/notifications');
        if (res.data) setNotifications(res.data);
        
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      }
    };

    loadData();
    
    // آپدیت خودکار هر 30 ثانیه
    const interval = setInterval(loadData, 30000);

    // گوش دادن به تغییرات توکن (وقتی در صفحات دیگر توکن کم می‌شود)
    const handleStorageChange = () => {
        const updatedUser = localStorage.getItem('user');
        if (updatedUser) setUser(JSON.parse(updatedUser));
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
        clearInterval(interval);
        window.removeEventListener("storage", handleStorageChange);
    };
  }, [location, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    toast.info('با موفقیت خارج شدید');
    navigate('/login');
  };

  const handleReadNotif = async (notif) => {
    if (!notif.isRead) {
      try {
        await client.put(`/notifications/${notif._id}/read`);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      } catch (e) {}
    }
    setShowNotifBox(false);
    if (notif.link) navigate(notif.link);
  };

  // 👇 لیست منوی اصلی
  const menuItems = [
    { icon: <FaHome />, label: 'پیشخوان', path: '/dashboard' },
    { icon: <FaCoins />, label: 'خرید اعتبار', path: '/dashboard/buy-tokens' }, // ✅ اضافه شد
    { icon: <FaHistory />, label: 'تاریخچه چت', path: '/dashboard/history' },
    { icon: <FaHeadset />, label: 'پشتیبانی', path: '/dashboard/tickets' },
    { icon: <FaUser />, label: 'پروفایل من', path: '/dashboard/profile' },
    { icon: <FaKey />, label: 'تغییر رمز', path: '/dashboard/change-password' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname !== '/dashboard') return false;
    return location.pathname.startsWith(path);
  };

  const getInitial = (name) => name ? name.charAt(0) : 'U';
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden dir-rtl font-sans">
      
      {/* 1. سایدبار (منوی کناری) */}
      <aside className={`
        fixed md:static inset-y-0 right-0 z-50 w-64 bg-slate-900 text-white shadow-2xl transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        {/* هدر سایدبار */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-gray-700 bg-slate-800">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {getInitial(user.name)}
          </div>
          <div className="overflow-hidden">
            <h2 className="text-sm font-bold truncate">{user.name}</h2>
            <div className="flex items-center gap-1 text-xs text-gray-400">
               <FaCoins className="text-yellow-400" />
               <span>{user.tokens} توکن</span>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden mr-auto text-gray-400 hover:text-white">
            <FaTimes size={20} />
          </button>
        </div>

        {/* لیست لینک‌ها */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                isActive(item.path) 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 translate-x-1' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`text-xl ${isActive(item.path) ? 'text-white' : 'text-gray-500 group-hover:text-white transition'}`}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* فوتر سایدبار */}
        <div className="p-4 border-t border-gray-700 bg-slate-900">
          <button 
            onClick={handleLogout} 
            className="flex w-full items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition cursor-pointer"
          >
            <FaSignOutAlt /> <span>خروج از حساب</span>
          </button>
        </div>
      </aside>

      {/* Overlay برای موبایل */}
      {isMobileMenuOpen && (
        <div onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"></div>
      )}

      {/* 2. محتوای اصلی */}
      <div className="flex-1 flex flex-col overflow-hidden w-full relative">
        
        {/* هدر بالای صفحه (مشترک موبایل و دسکتاپ) */}
        <header className="h-16 bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-between px-4 md:px-8 z-30 sticky top-0">
          
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 hover:bg-gray-100 rounded-lg">
              <FaBars size={24} />
            </button>
            <span className="font-bold text-slate-800 text-lg">پنل کاربری</span>
          </div>
          
          <div className="hidden md:block text-gray-500 text-sm font-medium">
             به پنل مدیریت هوشمند دامپزشکی خوش آمدید 👋
          </div>

          {/* بخش نوتیفیکیشن */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifBox(!showNotifBox)} 
              className="relative p-2.5 text-gray-500 hover:text-blue-600 transition rounded-full hover:bg-blue-50 bg-white border border-gray-100 shadow-sm group"
            >
              <FaBell size={20} className="group-hover:animate-swing" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                </>
              )}
            </button>

            {/* دراپ‌داون نوتیفیکیشن */}
            {showNotifBox && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifBox(false)}></div>
                <div className="absolute left-0 top-12 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 dir-rtl text-right animate-fadeIn">
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <span className="font-bold text-gray-800">اعلان‌ها</span>
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">{unreadCount} جدید</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                         <FaBell size={30} className="mb-2 opacity-20" />
                         <span className="text-sm">هیچ اعلان جدیدی ندارید.</span>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n._id} 
                          onClick={() => handleReadNotif(n)} 
                          className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition flex gap-3 ${n.isRead ? 'bg-white opacity-60' : 'bg-blue-50/30'}`}
                        >
                          <div className="mt-1.5 flex-shrink-0">
                             {!n.isRead ? <FaCircle size={8} className="text-blue-500" /> : <FaCircle size={8} className="text-gray-300" />}
                          </div>
                          <div>
                            <span className={`text-sm block mb-1 ${!n.isRead ? 'font-bold text-gray-800' : 'font-medium text-gray-600'}`}>{n.title}</span>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{n.message}</p>
                            <span className="text-[10px] text-gray-400 mt-2 block">
                              {new Date(n.createdAt).toLocaleDateString('fa-IR')}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
                     <button onClick={() => setShowNotifBox(false)} className="text-xs text-blue-600 hover:underline">بستن</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* محتوای صفحات */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth bg-gray-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
