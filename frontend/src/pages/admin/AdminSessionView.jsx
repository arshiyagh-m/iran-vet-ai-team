import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { FaUser, FaRobot, FaArrowRight, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

const AdminSessionView = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        // این روت را باید در سرور داشته باشیم (که داریم: /api/chat/sessions/:id)
        // اما چون ادمین هستیم، باید یک روت ادمین برای دیدن سشن دیگران بسازیم
        // یا از روت عمومی استفاده کنیم اگر ادمین دسترسی دارد.
        // برای امنیت بهتر، یک روت ادمین در سرور اضافه می‌کنیم (پایین توضیح میدم)
        const res = await client.get(`/admin/session-details/${sessionId}`);
        setMessages(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-4xl mx-auto h-[80vh] flex flex-col">
      
      {/* هدر */}
      <div className="flex items-center gap-4 border-b pb-4 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <FaArrowRight />
        </button>
        <h2 className="text-xl font-bold">مرور کامل مکالمه (فقط مشاهده)</h2>
      </div>

      {/* لیست پیام‌ها */}
      <div className="flex-1 overflow-y-auto space-y-6 p-4 bg-gray-50 rounded-xl">
        {loading ? <p className="text-center text-gray-400">در حال بارگذاری...</p> : messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.user ? 'justify-end' : 'justify-start'}`}> {/* اینجا لاجیک ساده: اگر سوال بود راست، جواب بود چپ */}
                
                {/* پیام کاربر (راست) */}
                {msg.question && (
                    <div className="flex flex-col items-end max-w-[80%]">
                        <div className="flex items-center gap-2 mb-1 text-xs text-gray-500">
                            {msg.user?.fullName} <FaUser />
                        </div>
                        <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none shadow-md">
                            {msg.question}
                        </div>
                    </div>
                )}

                {/* پیام ربات (چپ) */}
                {/* ما اینجا از ساختار Log استفاده میکنیم که هم سوال داره هم جواب */}
                {/* پس برای هر Log دو تا حباب میسازیم: اولی سوال، دومی جواب */}
            </div>
        ))}

        {/* اصلاح روش نمایش: چون دیتابیس ما لاگ محور است (هر رکورد شامل سوال و جواب است) */}
        {/* بهتر است اینجوری مپ کنیم: */}
        {messages.map((log) => (
            <div key={log._id} className="space-y-4 mb-6 border-b pb-4 last:border-0">
                {/* سوال کاربر */}
                <div className="flex justify-end">
                    <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none max-w-[80%] shadow-md">
                        {log.question}
                    </div>
                </div>

                {/* جواب ربات */}
                <div className="flex justify-start">
                    <div className={`p-4 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm border
                        ${log.isFallbackResponse ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}
                    `}>
                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-400 border-b pb-1">
                            <FaRobot /> 
                            {log.isFallbackResponse ? 'پاسخ عمومی' : 'پاسخ دیتابیس'}
                            <span className="mx-1">|</span>
                            منبع: {log.reference || '-'}
                        </div>
                        <p className="text-sm text-gray-800 whitespace-pre-line">{log.answer}</p>
                        
                        {/* نمایش فیدبک کاربر به ادمین */}
                        {(log.feedback) && (
                            <div className="mt-2 pt-2 border-t flex items-center gap-2 text-xs">
                                <span className="text-gray-500">نظر کاربر:</span>
                                {log.feedback === 'like' ? <FaThumbsUp className="text-green-500"/> : <FaThumbsDown className="text-red-500"/>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* فوتر: هشدار غیرفعال بودن */}
      <div className="mt-4 p-3 bg-gray-100 text-gray-500 text-center rounded-xl text-sm">
        🚫 شما در حالت "فقط مشاهده" هستید و امکان ارسال پیام در این گفتگو را ندارید.
      </div>

    </div>
  );
};

export default AdminSessionView;
