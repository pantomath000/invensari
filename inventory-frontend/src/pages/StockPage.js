import React, { useState, useContext, useEffect } from 'react';
import { addStockItem, updateStockItem, deleteStockItem, fetchStockItems } from '../api';
import { StockContext } from '../context/StockContext';
import { Link } from 'react-router-dom';

function StockPage({ showMessage }) {
  const { stockItems, setStockItems } = useContext(StockContext);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', unit: '' });
  const [units] = useState(['Kg', 'g', 'L', 'mL', 'pcs', 'Karung', 'Ton', 'Biji', 'sdm', 'sdt', 'Ikat', 'Sachet']);

  const loadStockItems = async () => {
    try {
      const response = await fetchStockItems();
      setStockItems(response.data);
    } catch (error) {
      showMessage('Gagal memuat stok barang. Silakan coba lagi.');
    }
  };

  useEffect(() => {
    loadStockItems();
  }, []);

  const handleAddItem = async () => {
    if (stockItems.some(item => item.name === newItem.name)) {
      showMessage('Barang sudah ada.');
      return;
    }
    try {
      await addStockItem(newItem);
      setNewItem({ name: '', quantity: '', unit: '' });
      showMessage('Barang berhasil ditambahkan.');
      loadStockItems();
    } catch (error) {
      showMessage('Gagal menambahkan barang. Silakan coba lagi.');
    }
  };

  const handleChange = (index, field, value) => {
    const updatedItems = stockItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setStockItems(updatedItems);
  };

  const handleEditItem = async (index) => {
    const item = stockItems[index];
    if (item.isEditing) {
      if (item.quantity < 0) {
        showMessage('Jumlah tidak boleh negatif.');
        return;
      }

      try {
        await updateStockItem(item.id, { name: item.name, quantity: parseFloat(item.quantity), unit: item.unit });
        item.isEditing = false;
        showMessage('Barang berhasil diperbarui.');
        loadStockItems();
      } catch (error) {
        showMessage('Gagal memperbarui barang. Silakan coba lagi.');
      }
    } else {
      item.isEditing = true;
      setStockItems([...stockItems]);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteStockItem(itemId);
      showMessage('Barang berhasil dihapus.');
      loadStockItems();
    } catch (error) {
      showMessage('Gagal menghapus barang. Silakan coba lagi.');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Stok</h1>

      <h2 style={styles.inputLabel}>Input Stok</h2>

      <div style={styles.inputContainer}>
        <input
          placeholder="Nama Barang"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          style={styles.input}
        />
        <input
          placeholder="Jumlah"
          type="number"
          value={newItem.quantity}
          onChange={(e) => {
            const value = e.target.value;
            if (value >= 0) {
              setNewItem({ ...newItem, quantity: value });
            }
          }}
          style={styles.input}
          min="0"
        />
        <select
          value={newItem.unit}
          onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
          style={styles.input}
          required  // Add this if you want to enforce a unit selection
        >
          <option value="" disabled>Unit</option>  // Placeholder option
          {units.map((unit) => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
        <button onClick={handleAddItem} style={styles.addButton}>+</button>
      </div>

      <h2 style={styles.tableTitle}>Daftar Stok</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.centerAlign}>No</th>
            <th style={styles.centerAlign}>Nama Barang</th>
            <th style={styles.centerAlign}>Jumlah</th>
            <th style={styles.centerAlign}>Unit</th>
            <th style={styles.centerAlign}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {stockItems.map((item, index) => (
            <tr key={index}>
              <td style={styles.centerAlign}>{index + 1}</td>
              <td style={styles.centerAlign}>
                {item.isEditing ? (
                  <input
                    value={item.name}
                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                    style={styles.input}
                  />
                ) : item.name}
              </td>
              <td style={styles.centerAlign}>
                {item.isEditing ? (
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value >= 0) {
                        handleChange(index, 'quantity', value);
                      }
                    }}
                    style={styles.input}
                  />
                ) : item.quantity}
              </td>
              <td style={styles.centerAlign}>
                {item.isEditing ? (
                  <select
                    value={item.unit}
                    onChange={(e) => handleChange(index, 'unit', e.target.value)}
                    style={styles.dropdown}
                  >
                    {units.map((unit) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                ) : (
                  <span>{item.unit}</span>
                )}
              </td>
              <td style={styles.centerAlign}>
                <div style={styles.actionContainer}>
                  <button onClick={() => handleEditItem(index)} style={styles.actionButton}>
                    {item.isEditing ? 'Simpan' : 'Edit'}
                  </button>
                  <button onClick={() => handleDeleteItem(item.id)} style={styles.actionButton}>Hapus</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={styles.navbar}>
        <Link to="/dashboard" style={styles.navItem}>
          <img src="/media/home.png" alt="Beranda" style={styles.icon} />
          <span>Beranda</span>
        </Link>
        <Link to="/stock" style={styles.navItem}>
          <img src="/media/stok.png" alt="Stok" style={styles.icon} />
          <span>Stok</span>
        </Link>
        <Link to="/transactions" style={styles.navItem}>
          <img src="/media/transaksi.png" alt="Transaksi" style={styles.icon} />
          <span>Transaksi</span>
        </Link>
        <Link to="/profile" style={styles.navItem}>
          <img src="/media/profil.png" alt="Profil" style={styles.icon} />
          <span>Profil</span>
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: `'Baloo 2', sans-serif`,
    padding: '20px',
    paddingBottom: '60px',
  },
  title: {
    color: '#8A5C34',
    fontSize: '1.8rem',
    marginBottom: '20px',
    textAlign: 'center',
  },
  inputLabel: {
    color: 'black',
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    textAlign: 'center',
  },
  inputContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  input: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #D9D9D9',
    fontSize: '1rem',
    fontFamily: `'Baloo 2', sans-serif`,
    width: '100%',
    boxSizing: 'border-box',
  },
  addButton: {
    padding: '10px',
    backgroundColor: '#8A5C34',
    color: '#FFFFFF',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: `'Baloo 2', sans-serif`,
    flex: '1 1 60px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: `'Baloo 2', sans-serif`,
    backgroundColor: '#F9F9F9',
  },
  centerAlign: {
    textAlign: 'center',
    padding: '5px',
    border: '1px solid #D9D9D9',
  },
  actionButton: {
    padding: '5px 10px',
    backgroundColor: '#8A5C34',
    color: '#FFFFFF',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: `'Baloo 2', sans-serif`,
    fontSize: '0.8rem',
  },
  navbar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#D9B18E',
    padding: '10px 0',
    boxSizing: 'border-box',
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#8A5C34',
    textDecoration: 'none',
    fontFamily: `'Baloo 2', sans-serif`,
  },
  dropdown: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #D9D9D9',
    fontSize: '1rem',
    fontFamily: `'Baloo 2', sans-serif`,
    width: '65px', // Ensure dropdown expands to the full width of the cell
    boxSizing: 'border-box', // Prevent overflow
  },
  tableTitle: {
    color: 'black', // Brownish color
    fontSize: '1rem',
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: `'Baloo 2', sans-serif`,
    marginBottom: '10px',
  },
  actionContainer: {
    display: 'flex', // Ensures buttons are aligned horizontally
    justifyContent: 'center', // Centers the buttons
    gap: '5px', // Adds space between buttons
  },
  icon: {
    width: '24px',
    height: '24px',
    marginBottom: '5px',
  },
  '@media (max-width: 768px)': {
    inputContainer: {
      flexDirection: 'column',
      alignItems: 'center',
    },
    table: {
      fontSize: '0.7rem',
    },
    addButton: {
      width: '100%',
    },
    centerAlign: {
      padding: '5px', // Reduce padding for less cramped view
    },
    dropdown: {
      fontSize: '0.8rem', // Smaller font for mobile
      width: '100%', // Let dropdown take full width on mobile
    },
    actionButton: {
      fontSize: '0.8rem',
      width: 'auto',
    },
  },
};

export default StockPage;
