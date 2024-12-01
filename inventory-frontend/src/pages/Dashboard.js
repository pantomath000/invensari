import React, { useEffect, useState } from 'react';
import { fetchDashboardData, fetchTransactions, deleteTransaction, fetchProducts, fetchFilteredTransactions } from '../api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Dashboard() {
    const [transactions, setTransactions] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const loadTransactions = async (productId = null) => {
        try {
            const response = productId
                ? await fetchFilteredTransactions(productId)
                : await fetchTransactions();
            const allTransactions = response.data;
            const topTransactions = allTransactions
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 100)
                .reverse(); // Reverse to maintain chronological order
            setTransactions(topTransactions);
        } catch (error) {
            console.error("Failed to fetch transactions:", error);
        }
    };

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const response = await fetchProducts();
                setProducts(response.data);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            }
        };

        loadTransactions();
        loadProducts();
    }, []);

    const handleProductChange = async (event) => {
        const productId = event.target.value;
        setSelectedProduct(productId);
        await loadTransactions(productId);
    };

    const handleDeleteTransaction = async (transactionId) => {
        try {
            await deleteTransaction(transactionId);
            setTransactions(transactions.filter((t) => t.id !== transactionId));
            alert("Transaksi berhasil dihapus, stok telah diperbarui.");
        } catch (error) {
            console.error("Error deleting transaction:", error);
            alert("Gagal menghapus transaksi.");
        }
    };

    const chartData = transactions.length
        ? {
            labels: transactions.map((transaction) => transaction.formatted_date), // X-axis: transaction dates
            datasets: [
                {
                    label: `Penjualan Untuk ${
                        selectedProduct
                            ? products.find((p) => p.id === parseInt(selectedProduct)).name
                            : "Semua Produk"
                    }`,
                    data: transactions.map((transaction) => transaction.quantity_sold), // Y-axis: quantity sold
                    fill: false,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                    pointBorderColor: 'rgba(75, 192, 192, 1)',
                    pointRadius: 5,
                    tension: 0.1,
                },
            ],
        }
        : null;

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Beranda</h1>

            <div style={styles.dropdownContainer}>
                <label htmlFor="productDropdown" style={styles.label}>Pilih Produk:</label>
                <select
                    id="productDropdown"
                    value={selectedProduct || ""}
                    onChange={handleProductChange}
                    style={styles.dropdown}
                >
                    <option value="">Semua Produk</option>
                    {products.map((product) => (
                        <option key={product.id} value={product.id}>
                            {product.name}
                        </option>
                    ))}
                </select>
            </div>

            {chartData && (
                <div style={styles.chartContainer}>
                    <Line data={chartData} options={{ maintainAspectRatio: false }} />
                </div>
            )}

            <div style={styles.transactionsContainer}>
                <h2 style={styles.sectionTitle}>Riwayat Transaksi</h2>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.centerAlign}>Tanggal Transaksi</th>
                            <th style={styles.centerAlign}>Nama Produk</th>
                            <th style={styles.centerAlign}>Jumlah Terjual</th>
                            <th style={styles.centerAlign}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction) => (
                            <tr key={transaction.id}>
                                <td style={styles.centerAlign}>{transaction.formatted_date || transaction.date}</td>
                                <td style={styles.centerAlign}>{transaction.product_name}</td>
                                <td style={styles.centerAlign}>{transaction.quantity_sold}</td>
                                <td style={styles.centerAlign}>
                                    <button
                                        style={styles.deleteButton}
                                        onClick={() => handleDeleteTransaction(transaction.id)}
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={styles.navbar}>
                <Link to="/" style={styles.navItem}>
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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: `'Baloo 2', sans-serif`,
        padding: '20px',
        paddingBottom: '60px',
    },
    title: {
        color: '#8A5C34',
        fontSize: '1.8rem',
        marginBottom: '20px',
    },
    dropdownContainer: {
        margin: '20px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        marginRight: '10px',
        fontWeight: 'bold',
    },
    dropdown: {
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc',
    },
    chartContainer: {
        width: '100%',
        maxWidth: '800px',
        height: '400px',
        backgroundColor: '#F0F0F0',
        padding: '10px',
        borderRadius: '8px',
    },
    transactionsContainer: {
        marginTop: '20px',
        width: '100%',
        maxWidth: '800px',
        border: '1px solid #D9D9D9',
        borderRadius: '8px',
        padding: '10px',
        backgroundColor: '#F9F9F9',
    },
    sectionTitle: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        color: '#8A5C34',
        marginBottom: '10px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    centerAlign: {
        textAlign: 'center',
        padding: '10px',
        border: '1px solid #D9D9D9',
    },
    deleteButton: {
        backgroundColor: '#8A5C34',
        color: '#FFFFFF',
        padding: '5px 10px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontFamily: `'Baloo 2', sans-serif`,
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
        textDecoration: 'none',
        color: '#8A5C34',
        fontFamily: `'Baloo 2', sans-serif`,
    },
    icon: {
        width: '24px',
        height: '24px',
        marginBottom: '5px',
    },
};

export default Dashboard;
