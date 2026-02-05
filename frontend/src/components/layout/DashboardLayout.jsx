import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaComments, FaHistory, FaUser, FaSignOutAlt, FaBars, FaTimes, FaHeadset, FaBell, FaCircle } from 'react-icons/fa';
import client from '../../api/client';


const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: 'کاربر', role: 'user' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // استیت‌های مربوط به نوتیفیکیشن
  const [notifications, setNotifications] = useState([]);
  const [showNotifBox, setShowNotifBox] = useState(false);

  // ۱. خواندن اطلاعات کاربر و نوتیفیکیشن‌ها
  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // 🔒 چک کردن اجبار تغییر رمز
        // اگر کاربر باید رمز عوض کند و الان در صفحه تغییر رمز نیست، هدایتش کن
        if (parsedUser.mustChangePassword && location.pathname !== '/dashboard/change-password') {
          navigate('/dashboard/change-password');
        }
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await client.get('/notifications');
        setNotifications(res.data);
      } catch (error) {
        console.error("خطا در دریافت نوتیفیکیشن", error);
      }
    };

    fetchUserData();
    fetchNotifications();

    // چک کردن نوتیفیکیشن هر ۳۰ ثانیه
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);

  }, [location, navigate]);

  // ۲. تابع خروج از حساب
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // ۳. مدیریت کلیک روی نوتیفیکیشن
  const handleReadNotif = async (notif) => {
    // اگر خوانده نشده بود، درخواست خواندن بفرست
    if (!notif.isRead) {
      try {
        await client.put(`/notifications/${notif._id}/read`);
        // آپدیت لوکال برای تغییر رنگ آنی
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      } catch (e) { console.error(e); }
    }
    // بستن باکس و رفتن به لینک
    setShowNotifBox(false);
    if (notif.link) navigate(notif.link);
  };

  const menuItems = [
    { icon: <FaHome />, label: 'پیشخوان', path: '/dashboard' },
    { icon: <FaComments />, label: 'شروع گفتگو', path: '/dashboard/chat' },
    { icon: <FaHistory />, label: 'تاریخچه', path: '/dashboard/history' },
    { icon: <FaUser />, label: 'پروفایل من', path: '/dashboard/profile' },
    { icon: <FaHeadset />, label: 'پشتیبانی', path: '/dashboard/tickets' },
  ];

  // تشخیص اینکه آیا لینک فعال است یا نه
  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname !== '/dashboard') return false;
    return location.pathname.startsWith(path);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden dir-rtl font-sans">
      
      {/* --- نوار کناری (Sidebar) --- */}
      <aside className={`
        fixed md:static inset-y-0 right-0 z-50 w-64 bg-slate-900 text-white shadow-2xl transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        
        {/* هدر سایدبار (پروفایل کاربر) */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-gray-700 bg-slate-800">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-green-500/30">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h2 className="text-sm font-bold truncate">{user.name}</h2>
            <p className="text-xs text-gray-400 capitalize">{user.role === 'admin' ? 'مدیر سیستم' : 'کاربر عادی'}</p>
          </div>
          {/* دکمه بستن منو در موبایل */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden mr-auto text-gray-400 hover:text-white">
            <FaTimes size={20} />
          </button>
        </div>

        {/* لینک‌های منو */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)} // بستن منو بعد از کلیک (در موبایل)
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                isActive(item.path)
                  ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`text-xl transition-transform group-hover:scale-110 ${isActive(item.path) ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* دکمه خروج */}
        <div className="p-4 border-t border-gray-700 bg-slate-900">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition cursor-pointer"
          >
            <FaSignOutAlt />
            <span>خروج از حساب</span>
          </button>
        </div>
      </aside>

      {/* ماسک تیره (فقط وقتی منو موبایل باز است) */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
        ></div>
      )}

      {/* --- محتوای اصلی --- */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        
        {/* هدر موبایل + نوتیفیکیشن */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 z-30 relative">
          
          <div className="flex items-center gap-3 md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-slate-600 hover:bg-gray-100 rounded-lg transition"
            >
              <FaBars size={24} />
            </button>
            <span className="font-bold text-slate-800 text-lg">Iran Vet AI</span>
          </div>

          {/* بخش دکمه نوتیفیکیشن (هم در موبایل هم دسکتاپ) */}
          <div className="relative mr-auto md:mr-0 ml-4">
            <button 
              onClick={() => setShowNotifBox(!showNotifBox)} 
              className="relative p-2 text-gray-600 hover:text-blue-600 transition rounded-full hover:bg-gray-100"
            >
              <FaBell size={24} />
              {/* نشانگر تعداد پیام‌های نخوانده */}
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
              )}
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {/* باکس باز شونده نوتیفیکیشن */}
            {showNotifBox && (
              <div className="absolute left-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                <div className="p-3 border-b bg-gray-50 font-bold text-gray-700 flex justify-between items-center">
                  <span>اعلان‌ها</span>
                  <span className="text-xs font-normal text-gray-500">{unreadCount} پیام جدید</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-8 text-center text-gray-400 text-sm">هیچ اعلان جدیدی ندارید.</p>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n._id} 
                        onClick={() => handleReadNotif(n)}
                        className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition flex gap-3 ${n.isRead ? 'bg-white opacity-70' : 'bg-blue-50/50'}`}
                      >
                        <div className="mt-1">
                          {!n.isRead ? <FaCircle size={8} className="text-blue-500" /> : <FaCircle size={8} className="text-gray-300" />}
                        </div>
                        <div>
                          <span className={`text-sm block mb-1 ${!n.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>{n.title}</span>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-gray-400 mt-2 block text-left dir-ltr">
                            {new Date(n.createdAt).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* محل نمایش صفحات (داشبورد، چت و...) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
