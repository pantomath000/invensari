import React, { useState, useEffect } from 'react';
import { fetchProducts, addProduct, updateProduct, deleteProduct, addTransaction, fetchStockItems } from '../api';
import { Link } from 'react-router-dom';

function TransactionsPage({ showMessage }) {
    const [products, setProducts] = useState([]);
    const [stockItems, setStockItems] = useState([]);
    const [newProduct, setNewProduct] = useState({ name: '', unit: '', ingredients: [] });
    const [newTransaction, setNewTransaction] = useState({ product: '', quantity_sold: '' });
    const [editingProduct, setEditingProduct] = useState(null);
    const [units] = useState(['Kg', 'g', 'L', 'mL', 'pcs', 'Karung', 'Ton', 'Biji', 'sdm', 'sdt', 'Ikat', 'Sachet']);

    useEffect(() => {
        const loadData = async () => {
            try {
                const stockResponse = await fetchStockItems();
                const productsResponse = await fetchProducts();
                setStockItems(stockResponse.data);
                setProducts(productsResponse.data);
            } catch (error) {
                showMessage('Gagal memuat data. Silakan coba lagi.');
            }
        };
        loadData();
    }, [showMessage]);

    const handleAddIngredient = () => {
        setNewProduct({
            ...newProduct,
            ingredients: [...newProduct.ingredients, { stock_item: '', quantity_required: '', unit: '' }],
        });
    };

    const handleIngredientChange = (index, field, value) => {
        const ingredients = [...newProduct.ingredients];
        ingredients[index][field] = value;

        if (field === 'stock_item') {
            const selectedItem = stockItems.find(item => item.id === parseInt(value));
            ingredients[index].unit = selectedItem ? selectedItem.unit : '';
        }

        setNewProduct({ ...newProduct, ingredients });
    };

    const handleDeleteIngredient = (index) => {
        setNewProduct((prevProduct) => ({
            ...prevProduct,
            ingredients: prevProduct.ingredients.filter((_, i) => i !== index),
        }));
    };

    const handleAddProduct = async () => {
        try {
            if (editingProduct) {
                const response = await updateProduct(editingProduct.id, newProduct);
                setProducts(products.map(prod => prod.id === editingProduct.id ? response.data : prod));
                setEditingProduct(null);
                showMessage('Produk diperbarui.');
            } else {
                const response = await addProduct(newProduct);
                setProducts([...products, response.data]);
                showMessage('Produk ditambahkan.');
            }
            setNewProduct({ name: '', unit: '', ingredients: [] });
        } catch (error) {
            showMessage('Gagal menyimpan produk.');
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setNewProduct({ ...product });
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await deleteProduct(productId);
            setProducts(products.filter((prod) => prod.id !== productId));
            showMessage('Produk dihapus.');
        } catch (error) {
            showMessage('Gagal menghapus produk.');
        }
    };

    const handleAddTransaction = async () => {
        try {
            await addTransaction(newTransaction);
            setNewTransaction({ product: '', quantity_sold: '' });
            showMessage('Penjualan dicatat.');
        } catch (error) {
            showMessage('Gagal mencatat penjualan.');
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Transaksi</h1>

            <h2 style={styles.sectionTitle}>Input Produk</h2>
            <div style={styles.inputContainer}>
                <input
                    placeholder="Nama Produk"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    style={styles.input}
                />
                <select
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    style={styles.input}
                >
                    <option value="">Unit</option>
                    {units.map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                    ))}
                </select>
                <button onClick={handleAddIngredient} style={styles.addButton}>Tambah Bahan Baku</button>
                <button onClick={handleAddProduct} style={styles.submitButton}>+</button>
            </div>

            <div style={styles.ingredientContainer}>
                {newProduct.ingredients.map((ingredient, index) => (
                    <div key={index} style={styles.ingredientRow}>
                        <select
                            onChange={(e) => handleIngredientChange(index, 'stock_item', e.target.value)}
                            value={ingredient.stock_item}
                            style={styles.input}
                        >
                            <option value="">Pilih Bahan</option>
                            {stockItems.map((item) => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Jumlah Bahan"
                            value={ingredient.quantity_required}
                            onChange={(e) => {
                                const value = Math.max(0, e.target.value);
                                handleIngredientChange(index, 'quantity_required', value);
                            }}
                            style={styles.input}
                        />
                        <span>{ingredient.unit}</span>
                        <button onClick={() => handleDeleteIngredient(index)} style={styles.actionButton}>Hapus</button>
                    </div>
                ))}
            </div>

            <h2 style={styles.sectionTitle}>Daftar Produk</h2>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.centerAlign}>No</th>
                        <th style={styles.centerAlign}>Nama Produk</th>
                        <th style={styles.centerAlign}>Unit</th>
                        <th style={styles.centerAlign}>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product, index) => (
                        <tr key={product.id}>
                            <td style={styles.centerAlign}>{index + 1}</td>
                            <td style={styles.centerAlign}>{product.name}</td>
                            <td style={styles.centerAlign}>{product.unit}</td>
                            <td style={styles.centerAlign}>
                                <div style={styles.actionContainer}>
                                    <button style={styles.actionButton} onClick={() => handleEditProduct(product)}>Edit</button>
                                    <button style={styles.actionButton} onClick={() => handleDeleteProduct(product.id)}>Hapus</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2 style={styles.sectionTitle}>Produk Terjual</h2>
            <div style={styles.inputContainer}>
                <select
                    onChange={(e) => setNewTransaction({ ...newTransaction, product: e.target.value })}
                    value={newTransaction.product}
                    style={styles.input}
                >
                    <option value="">Pilih Produk</option>
                    {products.map((product) => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                </select>
                <input
                    type="number"
                    placeholder="Jumlah yang terjual"
                    value={newTransaction.quantity_sold}
                    onChange={(e) => {
                        const value = Math.max(0, e.target.value);
                        setNewTransaction({ ...newTransaction, quantity_sold: value });
                    }}
                    style={styles.input}
                />
                <button onClick={handleAddTransaction} style={styles.submitButton}>Submit</button>
            </div>

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
    container: { fontFamily: `'Baloo 2', sans-serif`, padding: '20px', paddingBottom: '60px' },
    title: { color: '#8A5C34', fontSize: '1.8rem', marginBottom: '20px', textAlign: 'center', fontFamily: `'Baloo 2', sans-serif` },
    sectionTitle: { color: 'black', fontSize: '1rem', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center', fontFamily: `'Baloo 2', sans-serif` },
    inputContainer: { display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '20px' },
    ingredientContainer: { marginBottom: '20px' },
    ingredientRow: { display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '10px' },
    input: { padding: '10px', borderRadius: '5px', fontSize: '1rem', flex: '1 1 150px', fontFamily: `'Baloo 2', sans-serif` },
    addButton: { backgroundColor: '#8A5C34', color: '#FFFFFF', borderRadius: '5px', padding: '10px', flex: '1 1 100px', fontFamily: `'Baloo 2', sans-serif` },
    submitButton: { backgroundColor: '#8A5C34', color: '#FFFFFF', borderRadius: '5px', padding: '10px', flex: '1 1 100px', fontFamily: `'Baloo 2', sans-serif` },
    table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#F9F9F9', fontFamily: `'Baloo 2', sans-serif`, },
    centerAlign: { textAlign: 'center', padding: '10px', border: '1px solid #D9D9D9' },
    actionButton: { backgroundColor: '#8A5C34', color: '#FFFFFF', borderRadius: '5px', padding: '5px 10px', border: 'none',  cursor: 'pointer', fontFamily: `'Baloo 2', sans-serif`, fontSize: '0.8rem' },
    navbar: { position: 'fixed', bottom: 0, left: 0, width: '100%', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '10px 0', backgroundColor: '#D9B18E', boxSizing: 'border-box' },
    actionContainer: { display: 'flex', justifyContent: 'center', gap: '5px' },
    navItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#8A5C34', textDecoration: 'none', fontFamily: `'Baloo 2', sans-serif` },
    icon: { width: '24px', height: '24px', marginBottom: '5px' },
    '@media (max-width: 768px)': {
        inputContainer: { flexDirection: 'column' },
        ingredientRow: { flexDirection: 'column' },
        centerAlign: { padding: '5px' },
        actionContainer: { justifyContent: 'center', gap: '3px' },
        actionButton: { fontSize: '0.7rem' },
        table: { fontSize: '0.8rem' },
    }
};

export default TransactionsPage;
