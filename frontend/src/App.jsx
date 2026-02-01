import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/public/Home';

const App = () => {
  return (
    <div className="font-sans dir-rtl min-h-screen flex flex-col bg-gray-50">
      <ToastContainer position="top-right" rtl={true} />
      
      {/* هدر سایت همیشه بالاست */}
      <Header />

      {/* محتوای متغیر صفحات */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>

      {/* فوتر سایت همیشه پایین است */}
      <Footer />
    </div>
  );
};

export default App;
