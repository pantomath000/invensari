import React, { useState } from 'react';
import { register } from '../api';
import { useNavigate } from 'react-router-dom';

function RegisterPage({ showMessage }) {
  const [formData, setFormData] = useState({
    username: '', email: '', phone_number: '', address: '', password: '', business_name: ''
  });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      showMessage('Registrasi berhasil! Anda bisa masuk sekarang.');
      navigate('/login');
    } catch (error) {
      showMessage('Registrasi gagal. Silakan periksa data Anda dan coba lagi.');
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div style={styles.container}>
      {/* Add the logo frame */}
      <div style={styles.logoFrame}>
        <img src="/media/logoinvensari.png" alt="InvenSari Logo" style={styles.logo} />
        <div>
          <h2 style={styles.brandName}>InvenSari</h2>
          <p style={styles.tagline}>catat, kelola dan simpan stokmu!</p>
        </div>
      </div>
      <form onSubmit={handleRegister} style={styles.form}>
        <input 
          name="username" 
          onChange={handleChange} 
          placeholder="Username" 
          style={styles.input} 
        />
        <input 
          name="email" 
          type="email" 
          onChange={handleChange} 
          placeholder="Email" 
          style={styles.input} 
        />
        <input 
          name="phone_number" 
          onChange={handleChange} 
          placeholder="Nomor Telepon" 
          style={styles.input} 
        />
        <input 
          name="address" 
          onChange={handleChange} 
          placeholder="Alamat UMKM" 
          style={styles.input} 
        />
        <input 
          name="business_name" 
          onChange={handleChange} 
          placeholder="Nama UMKM" 
          style={styles.input} 
        />
        <input 
          name="password" 
          type="password" 
          onChange={handleChange} 
          placeholder="Password" 
          style={styles.input} 
        />
        <button type="submit" style={styles.button}>DAFTAR</button>
      </form>
      <div style={styles.loginContainer}>
        <span>Sudah memiliki akun? <a href="/login" style={styles.loginLink}>Masuk DISINI</a></span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#FFF8F3',
    padding: '40px 40px',
    fontFamily: `'Baloo 2', sans-serif`,
  },
  logoFrame: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    marginBottom: '20px',
  },
  logo: {
    width: '100px',
    height: '100px',
  },
  brandName: {
    fontSize: '2.0rem',
    color: '#8A5C34',
    fontWeight: 'bold',
    margin: 0,
    fontFamily: `'Baloo 2', sans-serif`,
  },
  tagline: {
    color: '#8A5C34',
    fontSize: '1.3rem',
    margin: 0,
    fontFamily: `'Baloo 2', sans-serif`,
  },
  form: {
    width: '100%',
    maxWidth: '400px',
    padding: '20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    fontFamily: `'Baloo 2', sans-serif`,
  },
  input: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #D9D9D9',
    fontSize: '1rem',
    fontFamily: `'Baloo 2', sans-serif`,
  },
  button: {
    padding: '10px',
    backgroundColor: '#8A5C34',
    color: '#FFFFFF',
    borderRadius: '5px',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    fontFamily: `'Baloo 2', sans-serif`,
  },
  loginContainer: {
    marginTop: '20px',
    fontFamily: `'Baloo 2', sans-serif`,
  },
  loginLink: {
    color: '#8A5C34',
    fontWeight: 'bold',
    textDecoration: 'none',
    fontFamily: `'Baloo 2', sans-serif`,
  },
};

export default RegisterPage;
