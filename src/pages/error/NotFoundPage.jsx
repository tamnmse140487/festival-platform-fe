import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, RefreshCw } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoHome = () => {
    setIsAnimating(true);
    setTimeout(() => navigate('/'), 300);
  };

  const handleGoBack = () => {
    setIsAnimating(true);
    setTimeout(() => window.history.back(), 300);
  };

  const handleRefresh = () => {
    setIsAnimating(true);
    setTimeout(() => window.location.reload(), 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        />
      ))}

      <div className={`relative z-10 text-center max-w-2xl mx-auto transform transition-all duration-300 ${isAnimating ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}>
        <div className="relative mb-8">
          <h1 className="text-9xl md:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 text-9xl md:text-[12rem] font-bold text-red-500 opacity-20 animate-pulse">
            404
          </div>
        </div>

        <div className="mb-8 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Oops! Trang không tồn tại
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            Trang bạn đang tìm kiếm không tồn tại.
          </p>
        </div>

        <div className="mb-8 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
          <p className="text-white mb-2">
            Tự động chuyển về trang chủ sau
          </p>
          <div className="text-3xl font-bold text-yellow-400 animate-pulse">
            {countdown}s
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleGoHome}
            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl"
          >
            <Home className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Về trang chủ
          </button>
          
          <button
            onClick={handleGoBack}
            className="group flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl hover:bg-white/30 transform hover:scale-105 transition-all duration-200 border border-white/30"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Quay lại
          </button>
          
          <button
            onClick={handleRefresh}
            className="group flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl hover:bg-white/30 transform hover:scale-105 transition-all duration-200 border border-white/30"
          >
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            Thử lại
          </button>
        </div>

        <div className="mt-12 p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Search className="w-5 h-5 text-gray-300" />
            <p className="text-gray-300">Có thể bạn đang tìm:</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {['Trang chủ', 'Đăng nhập', 'Lễ hội', 'Gian hàng', 'Trò chơi'].map((item) => (
              <button
                key={item}
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 p-4 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-lg border border-yellow-400/30">
          <p className="text-sm text-yellow-200">
            💡 <strong>Fun fact:</strong> Mã lỗi 404 có nguồn gốc từ phòng 404 tại CERN, nơi máy chủ web đầu tiên được đặt!
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;