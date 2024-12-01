import React, { useState, useEffect } from 'react';
import { fetchProfile, updateProfile, logout } from '../api';
import { Link } from 'react-router-dom';

function ProfilePage() {
  const [profile, setProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null); 

  const showMessage = (message) => alert(message);

  useEffect(() => {
    const loadProfile = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        window.location.href = '/login';
        return;
      }
      try {
        const response = await fetchProfile();
        setProfile(response.data);
      } catch (error) {
        console.error("Failed to load profile:", error);
        window.location.href = '/login';
      }
    };
    loadProfile();
  }, []);

  const handleEdit = () => setIsEditing(true);
  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const handleProfilePictureChange = (e) => setProfilePicture(e.target.files[0]);

  const handleSave = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      showMessage("User ID not found. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append('username', profile.username || "");
    formData.append('email', profile.email || "");
    formData.append('phone_number', profile.phone_number || "");
    formData.append('address', profile.address || "");
    formData.append('business_name', profile.business_name || "");

    if (profilePicture) {
      formData.append('profile_picture', profilePicture);
    }

    try {
      await updateProfile(userId, formData);
      setIsEditing(false);
      showMessage("Profile updated successfully!");
    } catch (error) {
      showMessage("Failed to save profile.");
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('userId');
    window.location.href = '/login';
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Profil</h1>

      <div style={styles.infoBox}>
        {profile.profile_picture ? (
          <img
            src={profile.profile_picture}
            alt="Profile"
            style={styles.profilePicture}
          />
        ) : (
          <div style={styles.placeholderIcon}>👤</div>
        )}

        <h2 style={styles.businessName}>{profile.business_name}</h2>

        {isEditing ? (
          <>
            <input
              name="username"
              placeholder="Nama Pengguna"
              value={profile.username || ''}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              name="business_name"
              placeholder="Nama UMKM"
              value={profile.business_name || ''}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={profile.email || ''}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              name="phone_number"
              placeholder="Nomor Telepon"
              value={profile.phone_number || ''}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              name="address"
              placeholder="Alamat"
              value={profile.address || ''}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              type="file"
              onChange={handleProfilePictureChange}
              accept="image/*"
              style={styles.input}
            />
            <button onClick={handleSave} style={styles.editButton}>Simpan</button>
          </>
        ) : (
          <div style={styles.infoContainer}>
            <div style={styles.infoRow}>
              <img src="/media/profus.png" alt="User Icon" style={styles.icon} />
              <span>{profile.username}</span>
            </div>
            <div style={styles.infoRow}>
              <img src="/media/emfus.png" alt="Email Icon" style={styles.icon} />
              <span>{profile.email}</span>
            </div>
            <div style={styles.infoRow}>
              <img src="/media/phonfus.png" alt="Phone Icon" style={styles.icon} />
              <span>{profile.phone_number}</span>
            </div>
            <div style={styles.infoRow}>
              <img src="/media/adfus.png" alt="Address Icon" style={styles.icon} />
              <span>{profile.address}</span>
            </div>
            <button onClick={handleEdit} style={styles.editButton}>Edit Profil</button>
          </div>
        )}

        <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
      </div>

      {/* Bottom Navigation Bar */}
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
  container: { fontFamily: `'Baloo 2', sans-serif`, padding: '20px', paddingBottom: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  title: { color: '#8A5C34', fontSize: '1.8rem', marginBottom: '20px' },
  infoBox: { backgroundColor: '#F7F7F7', padding: '20px', borderRadius: '10px', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' },
  profilePicture: { width: '150px', height: '150px', borderRadius: '50%', marginBottom: '10px' },
  placeholderIcon: { width: '100px', height: '100px', fontSize: '50px', textAlign: 'center', margin: '0 auto', marginBottom: '10px' },
  businessName: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' },
  infoContainer: { marginBottom: '20px' },
  infoRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  input: { padding: '10px', borderRadius: '5px', fontSize: '1rem', marginBottom: '10px', width: '100%' },
  icon: { width: '24px', height: '24px', marginBottom: '5px' },
  editButton: { fontFamily: `'Baloo 2', sans-serif`, backgroundColor: '#8A5C34', color: '#FFFFFF', padding: '10px', borderRadius: '5px', width: '100%', marginTop: '10px' },
  logoutButton: { fontFamily: `'Baloo 2', sans-serif`, backgroundColor: '#8A5C34', color: '#FFFFFF', padding: '10px', borderRadius: '5px', width: '100%', marginTop: '10px' },
  navbar: { position: 'fixed', bottom: 0, left: 0, width: '100vw', display: 'flex', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#D9B18E', padding: '10px 0', boxSizing: 'border-box' },
  navItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#8A5C34', textDecoration: 'none', fontFamily: `'Baloo 2', sans-serif` },
};

export default ProfilePage;
