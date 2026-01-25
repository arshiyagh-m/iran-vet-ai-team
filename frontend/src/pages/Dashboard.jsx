import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState({ fullName: 'کاربر', phone: '---' });

  // شبیه‌سازی دریافت اطلاعات
  useEffect(() => {
     const savedUser = JSON.parse(localStorage.getItem('userInfo'));
     if(savedUser) setUser(savedUser);
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-navy text-white p-6 hidden md:block">
        <h2 className="text-2xl font-bold mb-10 text-center">پنل کاربری</h2>
        <nav className="space-y-4">
          <SidebarBtn active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>پروفایل</SidebarBtn>
          <SidebarBtn active={activeTab === 'licenses'} onClick={() => setActiveTab('licenses')}>لایسنس‌ها</SidebarBtn>
          <SidebarBtn active={activeTab === 'tickets'} onClick={() => setActiveTab('tickets')}>تیکت‌ها</SidebarBtn>
          <SidebarBtn active={activeTab === 'history'} onClick={() => setActiveTab('history')}>تاریخچه چت</SidebarBtn>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">خوش آمدید، {user.fullName}</h1>
          <button className="bg-red-50 text-red-600 px-4 py-2 rounded hover:bg-red-100">خروج</button>
        </header>

        <div className="bg-white p-6 rounded-xl shadow-sm min-h-[400px]">
          {activeTab === 'profile' && (
            <div>
              <h3 className="text-xl font-bold mb-4">ویرایش اطلاعات</h3>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={user.fullName} readOnly className="border p-3 rounded bg-gray-50" />
                <input type="text" value={user.phone} readOnly className="border p-3 rounded bg-gray-50" />
              </div>
            </div>
          )}
          {activeTab === 'licenses' && <p>لیست لایسنس‌های شما در اینجا نمایش داده می‌شود.</p>}
          {activeTab === 'tickets' && <p>شما هیچ تیکت فعالی ندارید.</p>}
          {activeTab === 'history' && <p>تاریخچه گفتگوهای اخیر...</p>}
        </div>
      </main>
    </div>
  );
};

const SidebarBtn = ({ children, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full text-right px-4 py-3 rounded-lg transition ${active ? 'bg-brand-green' : 'hover:bg-white/10'}`}>
    {children}
  </button>
);

export default Dashboard;

