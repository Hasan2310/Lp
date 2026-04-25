import React, { useState } from "react";

const Login = ({ onSuccess }) => {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  // 🔐 password simpel (ubah bebas)
  const SECRET = "hasan123";

  const handleLogin = () => {
    if (password === SECRET) {
      localStorage.setItem("auth", "true");
      onSuccess();
    } else {
      alert("Password salah 😭");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0b1a] text-white">
      <div className="bg-[#1b1430] p-6 rounded-2xl w-80 shadow-lg">

        <h1 className="text-xl font-bold text-violet-400 mb-4">
          Login Dashboard
        </h1>

        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password"
            className="w-full p-3 rounded-xl bg-[#0f0b1a] border border-violet-500"
          />

          <button
            onClick={() => setShow(!show)}
            className="absolute right-3 top-3 text-sm"
          >
            👁
          </button>
        </div>

        <button
          onClick={handleLogin}
          className="w-full mt-4 bg-violet-600 p-2 rounded-xl font-bold"
        >
          Masuk
        </button>

        <p className="text-xs text-gray-400 mt-3">
          hint: hasan123
        </p>
      </div>
    </div>
  );
};

export default Login;