import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ChatSelection from './pages/ChatSelection';
import ChatRoom from './pages/ChatRoom';
import AdminPanel from './pages/AdminPanel';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat-selection" element={<ChatSelection />} />
        <Route path="/chat/:category" element={<ChatRoom />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
      <ToastContainer position="top-right" rtl={true} />
    </BrowserRouter>
  );
}

export default App;

