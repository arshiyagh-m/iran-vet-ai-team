import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaTimes, FaChevronLeft } from 'react-icons/fa';

// داده‌های سلسله مراتبی
const animals = [
  { 
    id: 'Poultry', 
    name: 'طیور', 
    desc: 'مدیریت مرغداری، بیماری‌ها و تغذیه', 
    color: 'bg-yellow-500',
    subTypes: ['صنعتی (گوشتی/تخمگذار)', 'زینتی و بومی', 'سایر ماکیان'],
    topics: ['تشخیص بیماری', 'جیره‌نویسی', 'مدیریت سالن', 'واکسیناسیون']
  },
  { 
    id: 'Cattle', 
    name: 'دام بزرگ', 
    desc: 'گاو شیری، پرواری و گوساله', 
    color: 'bg-blue-600',
    subTypes: ['گاو شیری', 'گاو پرواری', 'گوسفند و بز'],
    topics: ['بیماری‌های داخلی', 'تولید مثل', 'تغذیه', 'مدیریت گله']
  },
  { 
    id: 'Pets', 
    name: 'حیوانات خانگی', 
    desc: 'سگ، گربه و اگزوتیک', 
    color: 'bg-pink-500',
    subTypes: ['سگ', 'گربه', 'پرندگان زینتی', 'جوندگان'],
    topics: ['مشاوره رفتارشناسی', 'بیماری‌های داخلی', 'تغذیه', 'اورژانس']
  },
  { 
    id: 'Bees', 
    name: 'زنبور عسل', 
    desc: 'کندو و بیماری‌ها', 
    color: 'bg-amber-400',
    subTypes: ['زنبورستان صنعتی', 'تولید ژل رویال'],
    topics: ['آفات و بیماری‌ها', 'مدیریت فصلی', 'تغذیه کمکی']
  },
];

const ChatSelection = () => {
  const navigate = useNavigate();
  const [selectedAnimal, setSelectedAnimal] = useState(null); // حیوان انتخاب شده
  const [step, setStep] = useState(1); // مرحله ۱: انتخاب نوع، مرحله ۲: انتخاب موضوع
  const [selections, setSelections] = useState({ type: '', topic: '' });

  // باز کردن مودال
  const handleCardClick = (animal) => {
    setSelectedAnimal(animal);
    setStep(1);
    setSelections({ type: '', topic: '' });
  };

  // بستن مودال
  const closeModal = () => setSelectedAnimal(null);

  // انتخاب گزینه و رفتن به مرحله بعد یا شروع چت
  const handleSelection = (value, currentStep) => {
    if (currentStep === 1) {
      setSelections({ ...selections, type: value });
      setStep(2);
    } else {
      // پایان انتخاب -> رفتن به چت
      const finalData = { ...selections, topic: value };
      navigate(`/chat/${selectedAnimal.id}`, { state: finalData });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center relative">
      <h2 className="text-3xl font-bold text-brand-navy mb-4">انتخاب هوشمند</h2>
      <p className="text-gray-500 mb-10">برای شروع مشاوره تخصصی، دسته‌بندی مورد نظر را انتخاب کنید</p>
      
      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 z-0">
        {animals.map((animal) => (
          <div key={animal.id} className="group h-72 w-64 [perspective:1000px] cursor-pointer" 
               onClick={() => handleCardClick(animal)}>
            <div className="relative h-full w-full rounded-2xl shadow-xl transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
              
              {/* روی کارت */}
              <div className={`absolute inset-0 h-full w-full rounded-2xl ${animal.color} flex flex-col items-center justify-center [backface-visibility:hidden] text-white p-4`}>
                <h3 className="text-3xl font-bold mb-2">{animal.name}</h3>
                <span className="text-sm opacity-90 border border-white/30 px-3 py-1 rounded-full">کلیک کنید</span>
              </div>

              {/* پشت کارت */}
              <div className="absolute inset-0 h-full w-full rounded-2xl bg-brand-navy px-6 text-center text-slate-200 [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col items-center justify-center">
                <h3 className="text-xl font-bold mb-4">{animal.name}</h3>
                <p className="text-sm leading-relaxed">{animal.desc}</p>
                <button className="mt-6 bg-white text-brand-navy font-bold px-6 py-2 rounded-full text-sm hover:bg-gray-200 transition">
                  انتخاب جزئیات
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Selection Logic */}
      <AnimatePresence>
        {selectedAnimal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()} // جلوگیری از بسته شدن با کلیک روی خود مودال
            >
              {/* Modal Header */}
              <div className={`${selectedAnimal.color} p-6 flex justify-between items-center text-white`}>
                <div>
                  <h3 className="text-2xl font-bold">{selectedAnimal.name}</h3>
                  <p className="text-sm opacity-90">مرحله {step} از ۲: {step === 1 ? 'انتخاب نوع' : 'انتخاب موضوع'}</p>
                </div>
                <button onClick={closeModal} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
                  <FaTimes />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <h4 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                  {step === 1 ? 'نوع پرورش را انتخاب کنید:' : 'در چه زمینه‌ای سوال دارید؟'}
                </h4>
                
                <div className="space-y-3">
                  {(step === 1 ? selectedAnimal.subTypes : selectedAnimal.topics).map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelection(item, step)}
                      className="w-full text-right flex justify-between items-center p-4 rounded-xl border-2 border-gray-100 hover:border-brand-green hover:bg-green-50 transition group"
                    >
                      <span className="font-medium text-gray-700 group-hover:text-brand-green">{item}</span>
                      <FaChevronLeft className="text-gray-400 group-hover:text-brand-green transform transition-transform group-hover:-translate-x-1" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Back Button (Only for step 2) */}
              {step === 2 && (
                <div className="bg-gray-50 p-4 border-t text-left">
                  <button onClick={() => setStep(1)} className="text-gray-500 hover:text-brand-navy text-sm font-medium">
                    بازگشت به مرحله قبل
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatSelection;
