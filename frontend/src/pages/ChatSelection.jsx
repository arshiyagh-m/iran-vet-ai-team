import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const animals = [
  { id: 'Poultry', name: 'طیور', desc: 'مشاوره بیماری‌ها، جیره نویسی و مدیریت سالن', color: 'bg-yellow-500' },
  { id: 'Cattle', name: 'دام بزرگ', desc: 'گاو شیری، پرواری و مدیریت تولید مثل', color: 'bg-blue-600' },
  { id: 'Pets', name: 'حیوانات خانگی', desc: 'سگ، گربه و حیوانات اگزوتیک', color: 'bg-pink-500' },
  { id: 'Bees', name: 'زنبور عسل', desc: 'مدیریت کندو، آفات و بیماری‌ها', color: 'bg-amber-400' },
];

const ChatSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold text-brand-navy mb-10">انتخاب کنید: مشاوره برای کدام گروه؟</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {animals.map((animal) => (
          <div key={animal.id} className="group h-64 w-64 [perspective:1000px] cursor-pointer" 
               onClick={() => navigate(`/chat/${animal.id}`)}>
            <div className="relative h-full w-full rounded-xl shadow-xl transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
              
              {/* Front Face */}
              <div className={`absolute inset-0 h-full w-full rounded-xl ${animal.color} flex items-center justify-center [backface-visibility:hidden]`}>
                <h3 className="text-3xl font-bold text-white">{animal.name}</h3>
              </div>

              {/* Back Face */}
              <div className="absolute inset-0 h-full w-full rounded-xl bg-brand-navy px-4 text-center text-slate-200 [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col items-center justify-center">
                <h3 className="text-xl font-bold mb-2">{animal.name}</h3>
                <p>{animal.desc}</p>
                <button className="mt-4 bg-brand-green text-white px-4 py-2 rounded-full text-sm">شروع گفتگو</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSelection;

