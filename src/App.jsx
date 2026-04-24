import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./App.css";

const APP_PASSWORD = "hasan123"; // 🔐 ganti ini bebas

const App = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [masterData, setMasterData] = useState([]);
  const [isAuth, setIsAuth] = useState(false);

  const swalStyle = {
    background: "#1e1b2e",
    color: "#fff",
    confirmButtonColor: "#8b5cf6",
    customClass: {
      popup: "rounded-3xl",
      confirmButton: "rounded-xl",
    },
  };

  // 🔐 LOGIN SYSTEM
  useEffect(() => {
    const saved = localStorage.getItem("app_pass");
    if (saved === APP_PASSWORD) {
      setIsAuth(true);
    } else {
      loginPrompt();
    }
  }, []);

  const loginPrompt = () => {
    Swal.fire({
      title: "Masukin Password 🔐",
      input: "password",
      inputPlaceholder: "password...",
      allowOutsideClick: false,
      confirmButtonText: "Masuk",
      ...swalStyle,
      preConfirm: (value) => {
        if (value !== APP_PASSWORD) {
          Swal.showValidationMessage("Password salah 😭");
        }
        return value;
      },
    }).then((res) => {
      if (res.isConfirmed) {
        localStorage.setItem("app_pass", res.value);
        setIsAuth(true);
      }
    });
  };

  // 📥 FETCH DATA
  const fetchData = async () => {
    try {
      const res = await fetch("/api/sheet");
      const data = await res.json();

      if (!Array.isArray(data)) return;

      const normalized = data.map((item) => ({
        id: item.ID,
        kategori: item.Kategori,
        label: item.Label,
        val: Number(item.Val),
        checked: item.Checked === true || item.Checked === "true",
      }));

      setMasterData(normalized);
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  useEffect(() => {
    if (isAuth) fetchData();
  }, [isAuth]);

  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(angka);

  const pemasukan = masterData.filter((i) => i.kategori === "Pemasukan");
  const pengeluaranTetap = masterData.filter(
    (i) => i.kategori === "PengeluaranTetap"
  );
  const pengeluaranOpsional = masterData.filter(
    (i) => i.kategori === "PengeluaranOpsional"
  );

  const totalMasuk = pemasukan.reduce((s, i) => s + i.val, 0);
  const totalTetap = pengeluaranTetap.reduce((s, i) => s + i.val, 0);
  const totalOpsional = pengeluaranOpsional
    .filter((i) => i.checked)
    .reduce((s, i) => s + i.val, 0);

  const totalKeluar = totalTetap + totalOpsional;

  // 🌐 SYNC
  const syncToSheet = async (action, item) => {
    try {
      await fetch("/api/sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data: item }),
      });

      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  const openForm = (mode, item = {}) => {
    Swal.fire({
      ...swalStyle,
      title: mode === "ADD" ? "Tambah Data" : "Edit Data",
      html: `
        <input id="label" class="swal2-input" placeholder="Nama" value="${item.label || ""}">
        <input id="val" type="number" class="swal2-input" placeholder="Nominal" value="${item.val || ""}">
      `,
      preConfirm: () => ({
        label: document.getElementById("label").value,
        val: Number(document.getElementById("val").value),
      }),
    }).then((res) => {
      if (!res.isConfirmed) return;

      if (mode === "ADD") {
        syncToSheet("ADD", {
          id: Date.now(),
          kategori: item.kategori,
          ...res.value,
          checked: false,
        });
      } else {
        syncToSheet("EDIT", { ...item, ...res.value });
      }
    });
  };

  const deleteItem = (item) => {
    Swal.fire({
      ...swalStyle,
      title: "Hapus?",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      confirmButtonColor: "#ef4444",
    }).then((res) => {
      if (res.isConfirmed) syncToSheet("DELETE", item);
    });
  };

  const ItemRow = ({ item }) => (
    <div className="flex justify-between p-3 bg-white rounded-xl mb-2 text-black">
      <div>
        <p className="font-bold">{item.label}</p>
        <p className="text-sm">{formatRupiah(item.val)}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => openForm("EDIT", item)}>✏️</button>
        <button onClick={() => deleteItem(item)}>❌</button>
      </div>
    </div>
  );

  // 🔐 LOCK SCREEN
  if (!isAuth) return null;

  return (
    <div className="min-h-screen bg-[#0f0b1a] p-4 text-white">
      <h1 className="text-xl font-bold text-purple-400">Keuangan Hasan</h1>

      <div className="bg-purple-600 p-4 rounded-xl mt-3">
        Saldo: {formatRupiah(totalMasuk - totalKeluar)}
      </div>

      <button
        onClick={() => {
          localStorage.removeItem("app_pass");
          window.location.reload();
        }}
        className="mt-3 text-xs text-red-400"
      >
        Logout
      </button>

      <div className="mt-4">
        {masterData.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default App;