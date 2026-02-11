import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../services/mockDb';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';
import { loginApi } from '../services/apiAuth';


const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); 
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
const res = await loginApi(username, password);
    setLoading(false);

    if (res.success && res.data) {
      login(res.data);
      showToast(`Connexion réussie`, 'success');
      if (res.data.role === 'admin') navigate('/admin');
      else if (res.data.role === 'technician') navigate('/technician');
    } else {
      showToast(res.message || 'Erreur d\'authentification', 'error');
    }
  };

  return (
    <div className={`srm-login-universe ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');

        :root {
          --srm-blue: #0054A6;
          --srm-green: #8DC63F;
          --srm-yellow: #FFF200;
          --transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .dark-theme {
          --bg: #020617;
          --card-bg: rgba(255, 255, 255, 0.03);
          --text-main: #ffffff;
          --text-dim: rgba(255, 255, 255, 0.5);
          --input-bg: rgba(255, 255, 255, 0.05);
          --border: rgba(255, 255, 255, 0.1);
          --shadow: rgba(0, 0, 0, 0.5);
          --badge-bg: rgba(141, 198, 63, 0.2);
          --badge-text: #8DC63F;
        }

        .light-theme {
          --bg: #f1f5f9;
          --card-bg: rgba(255, 255, 255, 0.8);
          --text-main: #1e293b;
          --text-dim: #64748b;
          --input-bg: #ffffff;
          --border: rgba(0, 84, 166, 0.1);
          --shadow: rgba(0, 84, 166, 0.1);
          --badge-bg: #e0f2fe;
          --badge-text: #0054A6;
        }

        .srm-login-universe {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg);
          transition: var(--transition);
          overflow: hidden;
          position: relative;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .aura-blob {
          position: absolute;
          filter: blur(100px);
          border-radius: 50%;
          z-index: 1;
          opacity: 0.4;
          transition: var(--transition);
        }
        .blob-1 { width: 500px; height: 500px; background: var(--srm-blue); top: -100px; left: -100px; }
        .blob-2 { width: 400px; height: 400px; background: var(--srm-green); bottom: -50px; right: -50px; }

        .theme-toggle {
          position: absolute;
          top: 30px;
          right: 30px;
          z-index: 100;
          background: var(--card-bg);
          border: 1px solid var(--border);
          padding: 10px;
          border-radius: 50%;
          cursor: pointer;
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }

        .glass-portal {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          margin: 20px;
          background: var(--card-bg);
          backdrop-filter: blur(20px) saturate(160%);
          border: 1px solid var(--border);
          border-radius: 40px;
          padding: 70px 45px 45px;
          box-shadow: 0 40px 100px var(--shadow);
          transition: var(--transition);
        }

        .portal-logo {
          position: absolute;
          top: -50px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 100px;
          background: white;
          border-radius: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 15px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          z-index: 15;
          border: 4px solid var(--bg);
          transition: var(--transition);
        }

        /* --- STYLES DU NOUVEAU HEADER --- */
        .portal-header { 
          text-align: center; 
          margin-bottom: 40px; 
        }
        
        .portal-header .status-badge {
          display: inline-block;
          padding: 6px 14px;
          background: var(--badge-bg);
          color: var(--badge-text);
          border-radius: 100px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 16px;
          transition: var(--transition);
        }

        .portal-header h1 { 
          color: var(--text-main); 
          font-weight: 800; 
          font-size: 32px; 
          margin: 0;
          letter-spacing: -1px;
          transition: var(--transition); 
        }

        .portal-header p { 
          color: var(--text-dim); 
          font-size: 14px; 
          margin-top: 8px;
          font-weight: 500;
          transition: var(--transition); 
        }
        /* -------------------------------- */

        .input-box { margin-bottom: 25px; }
        .input-box label { color: var(--srm-blue); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; display: block; }
        
        .field-container {
          position: relative;
          background: var(--input-bg);
          border-radius: 20px;
          border: 1px solid var(--border);
          transition: var(--transition);
        }

        .field-container:focus-within {
          border-color: var(--srm-green);
          box-shadow: 0 0 20px rgba(141, 198, 63, 0.2);
        }

        .field-container input {
          width: 100%;
          background: transparent;
          border: none;
          padding: 18px 20px;
          color: var(--text-main);
          outline: none;
          font-size: 15px;
          box-sizing: border-box;
        }

        .btn-portal {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, var(--srm-blue), #003366);
          color: white;
          border: none;
          border-radius: 20px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: 0.3s;
          margin-top: 10px;
          box-shadow: 0 15px 30px rgba(0, 84, 166, 0.3);
        }
        .btn-portal:hover { transform: translateY(-3px); box-shadow: 0 20px 40px rgba(0, 84, 166, 0.5); }

      `}</style>

      <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
        {isDarkMode ? (
          <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-blue-900" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>

      <div className="aura-blob blob-1"></div>
      <div className="aura-blob blob-2"></div>

      <div className="glass-portal">
        <div className="portal-logo">
          <img src="/img/logo SRM.jpeg" alt="Logo SRM" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
        </div>

        {/* --- NOUVEAU HEADER --- */}
        <div className="portal-header">
          <div className="status-badge">
            {isDarkMode ? 'Système Sécurisé' : 'Espace Authentification'}
          </div>
          <h1>SRM Oriental</h1>
          <p>Portail de gestion multiservices</p>
        </div>
        {/* ---------------------- */}

        <form onSubmit={handleLogin}>
          <div className="input-box">
            <label>Utilisateur</label>
            <div className="field-container">
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Identifiant personnel"
                required
              />
            </div>
          </div>

          <div className="input-box">
            <label>Mot de passe</label>
            <div className="field-container">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-portal" disabled={loading}>
            {loading ? 'Authentification...' : 'Se connecter au portail'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;