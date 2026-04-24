import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './App.css';


const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [masterData, setMasterData] = useState([]);

  // 🎨 SweetAlert theme
  const swalStyle = {
    background: '#1e1b2e',
    color: '#fff',
    confirmButtonColor: '#8b5cf6',
    customClass: {
      popup: 'rounded-3xl',
      confirmButton: 'rounded-xl'
    }
  };

  // 📥 FETCH DATA
  const fetchData = async () => {
  try {
    const res = await fetch("/api/sheet");
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.log("API bukan array:", data);
      return;
    }

    const normalized = data.map(item => ({
      id: item.ID,
      kategori: item.Kategori,
      label: item.Label,
      val: Number(item.Val),
      checked: item.Checked === true || item.Checked === 'true'
    }));

    setMasterData(normalized);

  } catch (err) {
    console.log("Fetch error:", err);
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  // 💰 FORMAT RUPIAH
  const formatRupiah = (angka) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(angka);

  // 🔍 FILTER
  const pemasukan = masterData.filter(i => i.kategori === 'Pemasukan');
  const pengeluaranTetap = masterData.filter(i => i.kategori === 'PengeluaranTetap');
  const pengeluaranOpsional = masterData.filter(i => i.kategori === 'PengeluaranOpsional');
  const paylaterData = masterData.filter(i => i.kategori === 'Paylater');
  const utangData = masterData.filter(i => i.kategori === 'Utang');

  const totalMasuk = pemasukan.reduce((s, i) => s + i.val, 0);
  const totalTetap = pengeluaranTetap.reduce((s, i) => s + i.val, 0);
  const totalOpsionalChecked = pengeluaranOpsional
    .filter(i => i.checked)
    .reduce((s, i) => s + i.val, 0);

  const totalKeluar = totalTetap + totalOpsionalChecked;

  // 🌐 SYNC BACKEND (FIXED REAL API STYLE)
  const syncToSheet = async (action, item) => {
  try {
    const res = await fetch("/api/sheet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ action, data: item })
    });

    const result = await res.json();

    console.log("CRUD RESPONSE:", result);

    if (!res.ok) {
      throw new Error(result.error || "CRUD gagal");
    }

    fetchData();

  } catch (err) {
    console.log("Sync error:", err);
  }
};

  // ➕ ADD / EDIT FORM
  const openForm = (mode, item = {}) => {
    Swal.fire({
      ...swalStyle,
      title: mode === 'ADD' ? 'Tambah Data' : 'Edit Data',
      html: `
        <div style="display:flex;flex-direction:column;gap:10px;">
          <input id="label" class="swal2-input" placeholder="Nama"
            value="${item.label || ''}"
            style="border-radius:14px;background:#1b1430;color:#fff;border:1px solid #2d2550;">

          <input id="val" type="number" class="swal2-input" placeholder="Nominal"
            value="${item.val || ''}"
            style="border-radius:14px;background:#1b1430;color:#fff;border:1px solid #2d2550;">
        </div>
      `,
      preConfirm: () => ({
        label: document.getElementById('label').value,
        val: Number(document.getElementById('val').value)
      })
    }).then((res) => {
      if (!res.isConfirmed) return;

      if (mode === 'ADD') {
        syncToSheet('ADD', {
          id: Date.now(),
          kategori: item.kategori,
          ...res.value,
          checked: false
        });
      } else {
        syncToSheet('EDIT', { ...item, ...res.value });
      }
    });
  };

  // ❌ DELETE
  const deleteItem = (item) => {
    Swal.fire({
      ...swalStyle,
      title: 'Hapus data?',
      showCancelButton: true,
      confirmButtonText: 'Hapus',
      confirmButtonColor: '#ef4444'
    }).then((res) => {
      if (res.isConfirmed) syncToSheet('DELETE', item);
    });
  };

  // 🧾 ROW UI
  const ItemRow = ({ item, showCheck, colorClass }) => (
    <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-2xl mb-2">

      {showCheck && (
        <input
          type="checkbox"
          checked={!!item.checked}
          onChange={() =>
            syncToSheet('EDIT', { ...item, checked: !item.checked })
          }
        />
      )}

      <div className={`flex-1 ${item.checked ? 'opacity-40' : ''}`}>
        <p className="text-sm font-bold text-black">{item.label}</p>
        <p className={`text-xs font-black ${colorClass}`}>
          {formatRupiah(item.val)}
        </p>
      </div>

      <button
        onClick={() => openForm('EDIT', item)}
        className="text-xs text-violet-500 font-bold"
      >
        EDIT
      </button>

      <button
        onClick={() => deleteItem(item)}
        className="text-xs text-red-500 font-bold"
      >
        X
      </button>
    </div>
  );

  // 📱 UI
  return (
    <div className="min-h-screen bg-[#0f0b1a] p-4 text-white">
      <div className="max-w-md mx-auto">

        <h1 className="text-xl font-black text-violet-400">
          Keuangan Hasan
        </h1>

        {/* 💜 SALDO BERSIH */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-5 rounded-2xl mt-3">
          <p className="text-xs opacity-70">Saldo Bersih</p>
          <p className="text-2xl font-bold">
            {formatRupiah(totalMasuk - totalKeluar)}
          </p>
        </div>

        {/* TAB */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {['dashboard', 'paylater', 'utang'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`p-2 text-xs font-bold rounded-xl ${
                activeTab === tab
                  ? 'bg-violet-600 text-white'
                  : 'bg-[#1b1430] text-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="mt-4 space-y-5">
            <Section title="Pemasukan" list={pemasukan} color="text-green-400" add />
            <Section title="Pengeluaran Tetap" list={pengeluaranTetap} color="text-red-400" add />
            <Section title="Opsional" list={pengeluaranOpsional} color="text-yellow-400" check add />
          </div>
        )}

        {/* PAYLATER */}
        {activeTab === 'paylater' && (
          <Section title="Paylater" list={paylaterData} color="text-violet-400" add />
        )}

        {/* UTANG */}
        {activeTab === 'utang' && (
          <Section title="Utang" list={utangData} color="text-red-400" add />
        )}

      </div>
    </div>
  );

  function Section({ title, list, color, check, add }) {
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-bold text-gray-400">{title}</h3>

          {add && (
            <button
              onClick={() => openForm('ADD', { kategori: title })}
              className="text-xs bg-violet-600 px-3 py-1 rounded-lg font-bold"
            >
              + Tambah
            </button>
          )}
        </div>

        {list.map(i => (
          <ItemRow
            key={i.id}
            item={i}
            showCheck={check}
            colorClass={color}
          />
        ))}
      </div>
    );
  }
};

export default App;