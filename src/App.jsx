import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Login from "./components/login";
import Loading from "./components/loading";
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [masterData, setMasterData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  // 🔐 AUTH CHECK
  useEffect(() => {
    const auth = localStorage.getItem("auth");
    if (auth === "true") setIsAuth(true);
  }, []);

  // 📥 FETCH DATA
  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/sheet");
      const data = await res.json();

      if (!Array.isArray(data)) return;

      const normalized = data.map(item => ({
        id: item.ID,
        kategori: item.Kategori,
        label: item.Label,
        val: Number(item.Val),
        checked: item.Checked === true || item.Checked === 'true'
      }));

      setMasterData(normalized);

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuth) fetchData();
  }, [isAuth]);

  // 💰 FORMAT
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

  // 🌐 SYNC BACKEND (FIXED)
  const syncToSheet = async (action, item) => {
    try {
      const res = await fetch("/api/sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data: item })
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "CRUD gagal");

      fetchData();

    } catch (err) {
      console.log(err);
    }
  };

  // ➕ ADD / EDIT (FIXED SWEETALERT)
  const openForm = (mode, item = {}) => {
    Swal.fire({
      title: mode === 'ADD' ? 'Tambah Data' : 'Edit Data',
      background: '#1e1b2e',
      color: '#fff',
      showCancelButton: true,
      confirmButtonColor: '#8b5cf6',
      focusConfirm: false,

      html: `
        <input id="label" class="swal2-input" placeholder="Nama"
          value="${item.label || ''}">

        <input id="val" type="number" class="swal2-input" placeholder="Nominal"
          value="${item.val || ''}">
      `,

      preConfirm: () => {
        const label = document.getElementById('label').value;
        const val = Number(document.getElementById('val').value);

        if (!label || !val) {
          Swal.showValidationMessage("Isi dulu yang bener 😭");
          return false;
        }

        return { label, val };
      }
    }).then(res => {
      if (!res.isConfirmed) return;

      if (mode === 'ADD') {
        syncToSheet('ADD', {
          id: crypto.randomUUID(),
          kategori: item.kategori,
          ...res.value,
          checked: false
        });
      }

      if (mode === 'EDIT') {
        syncToSheet('EDIT', {
          ...item,
          ...res.value
        });
      }
    });
  };

  // ❌ DELETE (FIXED)
  const deleteItem = (item) => {
    Swal.fire({
      title: 'Hapus data?',
      text: "Data bakal hilang permanen",
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      background: '#1e1b2e',
      color: '#fff',
      confirmButtonText: 'Hapus'
    }).then(res => {
      if (res.isConfirmed) {
        syncToSheet('DELETE', item);
      }
    });
  };

  // 🧾 ROW
  const ItemRow = ({ item, colorClass, showCheck }) => (
    <div className="flex items-center gap-3 p-3 bg-white rounded-2xl mb-2">

      {showCheck && (
        <input
          type="checkbox"
          checked={!!item.checked}
          onChange={() =>
            syncToSheet('EDIT', { ...item, checked: !item.checked })
          }
        />
      )}

      <div className="flex-1">
        <p className="text-black font-bold text-sm">{item.label}</p>
        <p className={`text-xs font-bold ${colorClass}`}>
          {formatRupiah(item.val)}
        </p>
      </div>

      <button onClick={() => openForm('EDIT', item)} className="text-violet-500 text-xs font-bold">
        EDIT
      </button>

      <button onClick={() => deleteItem(item)} className="text-red-500 text-xs font-bold">
        X
      </button>
    </div>
  );

  // 🔐 LOGIN GATE
  if (!isAuth) {
    return (
      <Login
        onSuccess={() => {
          localStorage.setItem("auth", "true");
          setIsAuth(true);
        }}
      />
    );
  }

  // ⏳ LOADING
  if (loading) return <Loading />;

  // 📱 UI
  return (
    <div className="min-h-screen bg-[#0f0b1a] p-4 text-white">
      <div className="max-w-md mx-auto">

        <h1 className="text-xl font-black text-violet-400">
          Keuangan Hasan
        </h1>

        {/* SALDO */}
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

        {/* CONTENT */}
        {activeTab === 'dashboard' && (
          <div className="mt-4 space-y-4">
            <Section title="Pemasukan" list={pemasukan} color="text-green-400" />
            <Section title="Pengeluaran Tetap" list={pengeluaranTetap} color="text-red-400" />
            <Section title="Opsional" list={pengeluaranOpsional} color="text-yellow-400" />
          </div>
        )}

        {activeTab === 'paylater' && (
          <Section title="Paylater" list={paylaterData} color="text-violet-400" />
        )}

        {activeTab === 'utang' && (
          <Section title="Utang" list={utangData} color="text-red-400" />
        )}

      </div>
    </div>
  );

  function Section({ title, list, color }) {
    return (
      <div>
        <h3 className="text-xs text-gray-400 mb-2">{title}</h3>

        {list.map(i => (
          <ItemRow
            key={i.id}
            item={i}
            colorClass={color}
          />
        ))}
      </div>
    );
  }
};

export default App;