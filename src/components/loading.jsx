import React from "react";

const Loading = ({ text = "Mengambil data..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0b1a] text-white">
      <div className="text-center">
        {/* Spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent mx-auto mb-4"></div>

        {/* Text */}
        <p className="text-sm text-gray-400">{text}</p>
      </div>
    </div>
  );
};

export default Loading;