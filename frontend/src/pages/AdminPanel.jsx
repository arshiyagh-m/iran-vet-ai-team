import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const AdminPanel = () => {
    const [chatLogs, setChatLogs] = useState([]);

    // دریافت تاریخچه چت تمام کاربران برای ادمین
    useEffect(() => {
        const fetchLogs = async () => {
            const token = localStorage.getItem('token');
            const res = await axios.get('/admin/all-chats', { // فرض بر وجود این روت در ادمین
                headers: { Authorization: `Bearer ${token}` }
            });
            setChatLogs(res.data);
        };
        fetchLogs();
    }, []);

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <h2 className="text-3xl font-bold mb-6 text-brand-navy">مانیتورینگ هوشمند چت‌ها</h2>
            
            <div className="grid gap-4">
                {chatLogs.map((log) => (
                    <div 
                        key={log._id} 
                        className={`p-4 rounded-xl border-r-4 shadow-sm transition hover:shadow-md ${
                            log.isFallbackResponse 
                                ? 'bg-red-50 border-red-500' // استایل قرمز برای پاسخ‌های بدون دیتابیس
                                : 'bg-white border-brand-green'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-gray-700">
                                {log.isFallbackResponse && <span className="text-red-600 ml-2 animate-pulse">⚠️ خارج از دیتابیس</span>}
                                کاربر: {log.user?.fullName || 'ناشناس'}
                            </span>
                            <span className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString('fa-IR')}</span>
                        </div>

                        <p className="text-sm font-bold text-brand-navy mb-1">سوال: {log.question}</p>
                        
                        <div className="bg-gray-100 p-2 rounded text-sm text-gray-600 mt-2 max-h-20 overflow-y-auto">
                           پاسخ بات: {log.answer.substring(0, 150)}...
                        </div>

                        {log.isFallbackResponse && (
                            <div className="mt-3 flex justify-end">
                                <button className="bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700">
                                    افزودن این موضوع به دیتابیس +
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminPanel;

