import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={`landing-universe ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');

        :root {
          --srm-blue: #0054A6;
          --srm-green: #8DC63F;
          --srm-yellow: #FFF200;
          --transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .light-theme {
          --bg: #f8fafc;
          --text-main: #1e293b;
          --text-dim: #64748b;
          --glass: rgba(255, 255, 255, 0.7);
          --glass-border: rgba(255, 255, 255, 0.5);
          --card-shadow: rgba(0, 84, 166, 0.1);
          --toggle-bg: #e2e8f0;
        }

        .dark-theme {
          --bg: #020617;
          --text-main: #f8fafc;
          --text-dim: #94a3b8;
          --glass: rgba(15, 23, 42, 0.6);
          --glass-border: rgba(255, 255, 255, 0.1);
          --card-shadow: rgba(0, 0, 0, 0.5);
          --toggle-bg: #1e293b;
        }

        .landing-universe {
          min-height: 100vh;
          background-color: var(--bg);
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative;
          overflow: hidden;
          transition: var(--transition);
          padding: 0 20px 40px 20px;
        }

        /* Top Bar for Mode Switch */
        .top-bar {
            width: 100%;
            max-width: 1200px;
            display: flex;
            justify-content: flex-end;
            padding: 30px 0;
            z-index: 100;
        }

        .theme-switch-container {
            display: flex;
            align-items: center;
            gap: 12px;
            background: var(--glass);
            padding: 8px 16px;
            border-radius: 100px;
            border: 1px solid var(--glass-border);
            backdrop-filter: blur(10px);
        }

        .switch {
            position: relative;
            display: inline-block;
            width: 44px;
            height: 24px;
        }

        .switch input { opacity: 0; width: 0; height: 0; }

        .slider {
            position: absolute; cursor: pointer; inset: 0;
            background-color: var(--toggle-bg);
            transition: .4s; border-radius: 34px;
        }

        .slider:before {
            position: absolute; content: "";
            height: 18px; width: 18px; left: 3px; bottom: 3px;
            background-color: white; transition: .4s; border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        input:checked + .slider { background-color: var(--srm-blue); }
        input:checked + .slider:before { transform: translateX(20px); }

        /* Aura Blobs */
        .aura { position: absolute; filter: blur(120px); border-radius: 50%; z-index: 1; opacity: 0.2; transition: var(--transition); }
        .aura-1 { width: 500px; height: 500px; background: var(--srm-blue); top: -100px; left: -100px; }
        .aura-2 { width: 400px; height: 400px; background: var(--srm-green); bottom: -100px; right: -100px; }

        /* Brand Header */
        .brand-header { position: relative; z-index: 10; text-align: center; margin-bottom: 60px; }
        .logo-frame {
          width: 110px; height: 110px;
          background: white; border-radius: 35px;
          margin: 0 auto 25px; padding: 12px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 15px 40px rgba(0, 84, 166, 0.15);
          border: 4px solid var(--bg);
        }

        .brand-header h1 { font-size: 38px; font-weight: 800; color: var(--text-main); margin: 0; letter-spacing: -1.5px; }
        .brand-header p { color: var(--srm-blue); font-weight: 700; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; margin-top: 8px; }

        /* Grid & Cards */
        .portal-grid {
          position: relative; z-index: 10;
          display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 30px; max-width: 1100px; width: 100%;
        }

        .portal-card {
          background: var(--glass); backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border); border-radius: 45px;
          padding: 50px 40px; text-decoration: none; text-align: center;
          transition: var(--transition); box-shadow: 0 25px 50px var(--card-shadow);
          display: flex; flex-direction: column; align-items: center;
        }

        .portal-card:hover { transform: translateY(-12px); border-color: var(--srm-green); box-shadow: 0 40px 80px rgba(0, 84, 166, 0.15); }

        .icon-wrapper {
          width: 90px; height: 90px; border-radius: 30px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 30px; transition: var(--transition);
        }

        .card-client .icon-wrapper { background: linear-gradient(135deg, #e0f2fe, #bae6fd); color: var(--srm-blue); }
        .card-tech .icon-wrapper { background: linear-gradient(135deg, #f0fdf4, #dcfce7); color: var(--srm-green); }
        .card-admin .icon-wrapper { background: linear-gradient(135deg, #fffbeb, #fef9c3); color: #854d0e; }

        .portal-card h2 { color: var(--text-main); font-size: 24px; font-weight: 800; margin-bottom: 12px; }
        .portal-card p { color: var(--text-dim); font-size: 15px; line-height: 1.6; margin: 0; }

        footer { position: relative; z-index: 10; margin-top: auto; padding-top: 60px; color: var(--text-dim); font-size: 12px; letter-spacing: 1px; }

        @media (max-width: 768px) {
          .brand-header h1 { font-size: 28px; }
          .portal-grid { grid-template-columns: 1fr; }
          .top-bar { justify-content: center; }
        }
      `}</style>

      {/* Aura Blobs */}
      <div className="aura aura-1"></div>
      <div className="aura aura-2"></div>

      {/* Modern Top Bar with Toggle */}
      <div className="top-bar">
          <div className="theme-switch-container">
              <span style={{fontSize:'12px', fontWeight:700, color:'var(--text-dim)'}}>
                  {isDarkMode ? 'MODE NUIT' : 'MODE CLAIR'}
              </span>
              <label className="switch">
                  <input type="checkbox" checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} />
                  <span className="slider"></span>
              </label>
          </div>
      </div>

      {/* Header */}
      <header className="brand-header">
        <div className="logo-frame">
          <img src="/img/logo SRM.jpeg" alt="SRM" style={{width:'100%', height:'100%', objectFit:'contain'}} />
        </div>
        <h1>Portail Multiservices</h1>
        <p>SRM L'Oriental &bull; Digital Gateway</p>
      </header>

      {/* Grid */}
      <div className="portal-grid">
        
        {/* CLIENT CARD */}
        <Link to="/client" className="portal-card card-client">
          <div className="icon-wrapper">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
          </div>
          <h2>Espace Client</h2>
          <p>Accédez à vos contrats, gérez vos coordonnées et vérifiez votre identité en toute sécurité.</p>
        </Link>

        {/* TECHNICIAN CARD */}
        <Link to="/technician" className="portal-card card-tech">
          <div className="icon-wrapper">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          </div>
          <h2>Technicien</h2>
          <p>Outils de terrain pour la mise à jour des données et la validation des dossiers clients.</p>
        </Link>

        {/* ADMIN CARD */}
        <Link to="/admin" className="portal-card card-admin">
          <div className="icon-wrapper">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="7" r="4"/><path d="M12 15v3"/></svg>
          </div>
          <h2>Administration</h2>
          <p>Supervision complète du système, gestion des comptes staff et journaux d'audit.</p>
        </Link>

      </div>

      <footer>
        &copy; {new Date().getFullYear()} SRM L'ORIENTAL SA &bull; DIRECTION DES SYSTÈMES D'INFORMATION
      </footer>
    </div>
  );
};

export default LandingPage;