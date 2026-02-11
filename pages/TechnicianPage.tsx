import React, { useState, useEffect } from 'react';
import { dbService } from '../services/mockDb';
import { User } from '../types';
import UserModal from '../components/UserModal';
import { useAuth } from '../context/AuthContext';

const TechnicianPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false); 
  
  const [selectedUser, setSelectedUser] = useState<User | Partial<User> | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('edit');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadUsers = async () => {
    const res = await dbService.getAllUsers();
    if (res.data) setUsers(res.data);
  };

  useEffect(() => {
    loadUsers();
  }, [isModalOpen]);

  const filteredUsers = [...users]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .filter(u => {
        const lowerTerm = searchTerm.toLowerCase();
        return (
            u.contract.toLowerCase().includes(lowerTerm) || 
            u.nom.toLowerCase().includes(lowerTerm) ||
            u.cin.toLowerCase().includes(lowerTerm) ||
            (u.lastModifiedBy && u.lastModifiedBy.toLowerCase().includes(lowerTerm))
        );
    });

  const handleEditUser = (u: User) => {
    setSelectedUser(u);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    const newUser: Partial<User> = {
      contract: '', nom: '', cin: '', phone: '', phone2: null,
      lastModifiedBy: user?.username || 'Technicien'
    };
    setSelectedUser(newUser);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const verifiedCount = users.filter(u => u.phoneVerified).length;
  const pendingCount = users.length - verifiedCount;

  return (
    <div className={`tech-layout ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <style>{`
            :root {
                --srm-blue: #0054A6;
                --srm-green: #8DC63F;
                --srm-yellow: #FFF200;
                --transition: all 0.3s ease;
            }

            .light-theme {
                --bg-main: #f0f2f5;
                --sidebar-bg: #003366;
                --card-bg: #ffffff;
                --header-bg: #ffffff;
                --text-main: #1e293b;
                --text-dim: #64748b;
                --border-color: #e2e8f0;
                --item-hover: #fcfdfe;
                --contract-color: #0054A6;
                --input-bg: #f8fafc;
            }

            .dark-theme {
                --bg-main: #020617;
                --sidebar-bg: #0f172a;
                --card-bg: #1e293b;
                --header-bg: #0f172a;
                --text-main: #f8fafc;
                --text-dim: #cbd5e1;
                --border-color: #334155;
                --item-hover: #2d3748;
                --contract-color: #60a5fa;
                --input-bg: #334155;
            }

            .tech-layout {
                display: flex;
                height: 100vh;
                background-color: var(--bg-main);
                font-family: 'Inter', sans-serif;
                color: var(--text-main);
                transition: var(--transition);
            }

            .dark-theme .bg-white { 
                background-color: var(--card-bg) !important; 
                color: var(--text-main) !important;
            }
            .dark-theme input, .dark-theme textarea, .dark-theme select {
                background-color: var(--input-bg) !important;
                color: var(--text-main) !important;
                border-color: var(--border-color) !important;
            }
            .dark-theme label { color: var(--text-dim) !important; }

            .tech-sidebar {
                width: 260px;
                background: var(--sidebar-bg);
                display: flex;
                flex-direction: column;
                color: white;
                box-shadow: 4px 0 10px rgba(0,0,0,0.1);
                transition: var(--transition);
            }

            .tech-brand {
                padding: 30px;
                display: flex;
                flex-direction: column;
                align-items: center;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }

            .tech-logo-frame {
                width: 80px; height: 80px;
                background: white; border-radius: 15px;
                padding: 10px; margin-bottom: 15px;
            }
            .tech-logo-frame img { width: 100%; height: 100%; object-fit: contain; }

            .tech-nav { flex: 1; padding: 20px 0; }
            .tech-nav-item {
                padding: 15px 30px;
                display: flex; align-items: center; gap: 12px;
                color: rgba(255,255,255,0.7);
                border: none; background: transparent; width: 100%;
                cursor: pointer; font-size: 14px; font-weight: 500;
                transition: var(--transition);
            }
            .tech-nav-item.active {
                background: rgba(255,255,255,0.05);
                color: var(--srm-green);
                border-left: 4px solid var(--srm-green);
            }

            .tech-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

            .tech-header {
                background: var(--header-bg); height: 70px;
                display: flex; align-items: center; justify-content: space-between;
                padding: 0 40px; border-bottom: 1px solid var(--border-color);
                transition: var(--transition);
            }

            .search-container { position: relative; width: 400px; }
            .search-container input {
                width: 100%; padding: 10px 15px 10px 40px;
                border-radius: 8px; border: 1px solid var(--border-color);
                background: var(--input-bg); outline: none; color: var(--text-main);
                transition: var(--transition);
            }

            .tech-content { flex: 1; padding: 40px; overflow-y: auto; }

            .stats-bar { display: flex; gap: 20px; margin-bottom: 30px; }
            .stat-card {
                flex: 1; background: var(--card-bg); padding: 20px;
                border-radius: 12px; border: 1px solid var(--border-color);
                display: flex; align-items: center; gap: 15px;
                transition: var(--transition);
            }
            .stat-icon {
                width: 48px; height: 48px; border-radius: 12px;
                display: flex; align-items: center; justify-content: center;
                transition: var(--transition);
            }

            .contract-list { background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden; transition: var(--transition); }
            
            .list-header {
                display: flex; align-items: center; justify-content: space-between;
                padding: 20px 30px; border-bottom: 1px solid var(--border-color);
            }

            .list-item {
                display: flex; align-items: center; padding: 15px 30px;
                border-bottom: 1px solid var(--border-color); transition: 0.2s;
                cursor: pointer;
            }
            .list-item:hover { background: var(--item-hover); }

            .item-contract { width: 120px; font-family: monospace; font-weight: 800; color: var(--contract-color); font-size: 15px; }
            .item-info { flex: 1; }
            .item-info h4 { margin: 0; font-size: 15px; color: var(--text-main); font-weight: 700; }
            .item-info p { margin: 0; font-size: 12px; color: var(--text-dim); }
            .item-modifier { width: 180px; font-size: 12px; color: var(--text-dim); }
            .item-status { width: 120px; text-align: right; }

            .status-pill { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }

            .btn-add {
                background: var(--srm-green); color: white;
                border: none; padding: 10px 20px; border-radius: 8px;
                font-weight: 600; cursor: pointer; transition: 0.3s;
            }

            .theme-toggle-btn {
                background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                color: white; padding: 10px; border-radius: 10px;
                cursor: pointer; display: flex; align-items: center; justify-content: center;
                margin: 0 20px 20px; font-size: 12px; transition: var(--transition);
            }
            .theme-toggle-btn:hover { background: var(--srm-green); }

        `}</style>

        <aside className="tech-sidebar">
            <div className="tech-brand">
                <div className="tech-logo-frame">
                    <img src="/img/logo SRM.jpeg" alt="SRM Logo" />
                </div>
                <span style={{fontWeight: 800, fontSize: '14px', letterSpacing: '1px'}}>SRM ORIENTAL</span>
                <span style={{fontSize: '10px', opacity: 0.5, marginTop: '5px'}}>TECHNICIEN PORTAIL</span>
            </div>

            <nav className="tech-nav">
                <button className="tech-nav-item active"> Liste des Contrats</button>
            </nav>

            <button className="theme-toggle-btn" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? '☀️ Mode Clair' : '🌙 Mode Nuit'}
            </button>

            <div style={{padding: '30px', fontSize: '12px', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
                <div style={{opacity: 0.6}}>Utilisateur :</div>
                <div style={{fontWeight: 600, color: 'var(--srm-green)'}}>{user?.username}</div>
            </div>
        </aside>

        <main className="tech-main">
            <header className="tech-header">
                <div className="search-container">
                    <span style={{position: 'absolute', left: '15px', top: '10px'}}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </span>
                    <input 
                        type="text" 
                        placeholder="Rechercher un dossier..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn-add" onClick={handleCreateNew}>+ Nouveau Contrat</button>
            </header>

            <div className="tech-content">
                <div className="stats-bar">
                    <div className="stat-card">
                        <div className="stat-icon" style={{background: isDarkMode ? '#1e3a8a' : '#eff6ff', color: isDarkMode ? '#93c5fd' : 'var(--srm-blue)'}}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        </div>
                        <div>
                            <div style={{fontSize: '12px', color: 'var(--text-dim)'}}>Total Dossiers</div>
                            <div style={{fontSize: '18px', fontWeight: 800}}>{users.length}</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{background: isDarkMode ? '#064e3b' : '#f0fdf4', color: isDarkMode ? '#6ee7b7' : 'var(--srm-green)'}}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        </div>
                        <div>
                            <div style={{fontSize: '12px', color: 'var(--text-dim)'}}>Vérifiés</div>
                            <div style={{fontSize: '18px', fontWeight: 800}}>{verifiedCount}</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{background: isDarkMode ? '#451a03' : '#fffbeb', color: '#d97706'}}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                        <div>
                            <div style={{fontSize: '12px', color: 'var(--text-dim)'}}>En attente</div>
                            <div style={{fontSize: '18px', fontWeight: 800}}>{pendingCount}</div>
                        </div>
                    </div>
                </div>

                <div className="contract-list">
                    <div className="list-header">
                        <h3 style={{margin: 0, fontSize: '16px'}}>Répertoire des contrats</h3>
                        <span style={{fontSize: '12px', color: 'var(--text-dim)'}}>{filteredUsers.length} résultats trouvés</span>
                    </div>

                    {filteredUsers.map(u => (
                        <div key={u.id} className="list-item" onClick={() => handleEditUser(u)}>
                            <div className="item-contract">{u.contract}</div>
                            <div className="item-info">
                                <h4>{u.nom}</h4>
                                <p>CIN: {u.cin}</p>
                            </div>
                            <div className="item-modifier">
                                <b>Modifié par:</b><br/>
                                {u.lastModifiedBy || 'Système'}
                            </div>
                            <div className="item-status">
                                <span className="status-pill" style={{
                                    background: u.phoneVerified ? (isDarkMode ? '#064e3b' : '#dcfce7') : (isDarkMode ? '#451a03' : '#fef9c3'),
                                    color: u.phoneVerified ? (isDarkMode ? '#6ee7b7' : '#166534') : (isDarkMode ? '#fcd34d' : '#854d0e'),
                                }}>
                                    {u.phoneVerified ? 'VÉRIFIÉ' : 'ATTENTE'}
                                </span>
                            </div>
                        </div>
                    ))}
                    
                    {filteredUsers.length === 0 && (
                        <div style={{padding: '40px', textAlign: 'center', color: 'var(--text-dim)'}}>
                            Aucun dossier ne correspond à votre recherche.
                        </div>
                    )}
                </div>
            </div>
        </main>

        {selectedUser && (
            <UserModal 
                user={selectedUser} 
                mode={modalMode} 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                currentUserRole={user?.role}
                currentUserName={user?.username}
                onSave={loadUsers}
            />
        )}
    </div>
  );
};

export default TechnicianPage;