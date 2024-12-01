import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';
import { jwtDecode } from "jwt-decode";

function LoginPage({ showMessage }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ username, password });
      const decodedToken = jwtDecode(response.data.access);
      const userId = decodedToken.user_id;

      if (userId) {
        localStorage.setItem('userId', userId);
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        showMessage('Login successful!');
        navigate('/dashboard');
      } else {
        showMessage('Login failed. User ID not found.');
      }
    } catch (error) {
      showMessage('Login failed. Please check your credentials and try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.logoFrame}>
        <img src="/media/logoinvensari.png" alt="InvenSari Logo" style={styles.logo} />
        <div>
          <h2 style={styles.brandName}>InvenSari</h2>
          <p style={styles.tagline}>catat, kelola dan simpan stokmu!</p>
        </div>
      </div>
      <form onSubmit={handleLogin} style={styles.form}>
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="Username" 
          style={styles.input}
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
          style={styles.input}
        />
        <button type="submit" style={styles.button}>MASUK</button>
      </form>
      <div style={styles.registerContainer}>
        <span>Belum memiliki akun? <Link to="/register" style={styles.registerLink}>Daftar DISINI</Link></span>
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
    padding: '20px',
    fontFamily: `'Baloo 2', sans-serif`,  // Apply Baloo font to the container
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
  registerContainer: {
    marginTop: '20px',
  },
  registerLink: {
    color: '#8A5C34',
    fontWeight: 'bold',
    textDecoration: 'none',
  }
};

export default LoginPage;
