import React, { useEffect, useState, useRef } from 'react';
import { dbService } from '../services/mockDb';
import { User, AuditLog, Technician } from '../types';
import UserModal from '../components/UserModal';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';

type ViewMode = 'users' | 'staff' | 'audit' | 'settings';

const AdminPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('users');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [staff, setStaff] = useState<Technician[]>([]);
  const [search, setSearch] = useState('');
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userModalMode, setUserModalMode] = useState<'create'|'edit'>('edit');
  const { user } = useAuth();

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Partial<Technician>>({});
  const [newPassword, setNewPassword] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadData(); }, [currentView, isUserModalOpen, isStaffModalOpen]);

  const loadData = async () => {
    if (currentView === 'users') {
      const res = await dbService.getAllUsers();
      if (res.data) setUsers(res.data);
    } else if (currentView === 'audit') {
      const res = await dbService.getAuditLogs();
      if (res.data) setLogs(res.data);
    } else if (currentView === 'staff') {
      const res = await dbService.getStaff();
      if (res.data) setStaff(res.data);
    }
  };

  const verifiedCount = users.filter(u => u.phoneVerified).length;
  const pendingCount = users.length - verifiedCount;

  const handleCreateUser = () => {
      setSelectedUser({ contract: '', nom: '', cin: '', phone: '', phone2: null, phoneUpdateCount: 0, lastModifiedBy: user?.username || 'admin' } as any);
      setUserModalMode('create');
      setIsUserModalOpen(true);
  };

  const handleRowClick = (u: User) => {
      setSelectedUser(u);
      setUserModalMode('edit');
      setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (e: React.MouseEvent, id: number) => {
      e.stopPropagation();
      if (window.confirm('Supprimer ce contrat ?')) {
          const res = await dbService.deleteUser(id, user?.username || 'admin');
          if (res.success) { showToast('Supprimé avec succès', 'success'); loadData(); }
      }
  };

  const handleEditStaff = (tech: Technician) => { setSelectedStaff(tech); setIsStaffModalOpen(true); };
  const handleCreateStaff = () => { setSelectedStaff({ name: '', email: '', phone: '', username: '', password: '' }); setIsStaffModalOpen(true); };

  const saveStaff = async () => {
      if (!selectedStaff.username || !selectedStaff.password || !selectedStaff.name) {
          showToast('Champs requis', 'error'); return;
      }
      const res = await dbService.saveStaff(selectedStaff as Technician, user?.username || 'admin');
      if (res.success) { setIsStaffModalOpen(false); loadData(); }
  };

  const handleDeleteStaff = async (id: number) => {
      if (window.confirm('Supprimer ce technicien ?')) {
          const res = await dbService.deleteStaff(id, user?.username || 'admin');
          if (res.success) loadData();
      }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      const res = await dbService.changePassword(user?.username || 'admin', newPassword);
      if (res.success) { showToast('Succès', 'success'); setNewPassword(''); }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Contract', 'Nom', 'CIN', 'Phone', 'Verified', 'Modifie_Par'];
    const rows = users.map(u => [u.id, u.contract, u.nom, u.cin, u.phone || '', u.phoneVerified ? 'Oui' : 'Non', u.lastModifiedBy || 'System']);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `export_srm.csv`);
    link.click();
  };

  const triggerImport = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = async (evt) => {
          const text = evt.target?.result as string; if (!text) return;
          const lines = text.split('\n');
          const usersToImport: Partial<User>[] = [];
          for (let i = 1; i < lines.length; i++) {
              const cols = lines[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
              if (cols.length >= 2) usersToImport.push({ contract: cols[0], nom: cols[1], cin: cols[2] || '', phone: cols[3] || '', lastModifiedBy: user?.username || 'admin' });
          }
          await dbService.importUsers(usersToImport, user?.username || 'admin');
          loadData();
      };
      reader.readAsText(file);
  };

  // --- TRI : Nouveaux en premier ---
  const filteredUsers = [...users]
    .sort((a, b) => b.id - a.id)
    .filter(u => !search || u.contract.toLowerCase().includes(search.toLowerCase()) || u.nom.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={`srm-universe ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <style>{`
            :root {
                --srm-blue: #0054A6;
                --srm-green: #8DC63F;
                --srm-yellow: #FFF200;
                --transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .light-theme {
                --bg-main: #f4f7fa;
                --glass: rgba(255, 255, 255, 0.85);
                --sidebar-bg: #003366;
                --card-bg: #ffffff;
                --input-bg: #f8fafc;
                --text-main: #1e293b;
                --text-dim: #64748b;
                --border-sep: #e2e8f0;
                --contract-color: #0054A6;
                --item-hover: #f1f5f9;
            }

            .dark-theme {
                --bg-main: #020617;
                --glass: rgba(15, 23, 42, 0.8);
                --sidebar-bg: #0f172a;
                --card-bg: #1e293b;
                --input-bg: #334155;
                --text-main: #f8fafc;
                --text-dim: #94a3b8;
                --border-sep: #334155;
                --contract-color: #ffffff;
                --item-hover: #2d3748;
            }

            .srm-universe { display: flex; height: 100vh; background: var(--bg-main); font-family: 'Poppins', sans-serif; overflow: hidden; position: relative; transition: var(--transition); }
            
            /* SIDEBAR */
            .srm-glass-sidebar { width: 280px; margin: 20px; background: var(--sidebar-bg); border-radius: 30px; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.1); z-index: 10; transition: var(--transition); color: white; }
            .brand-box { padding: 40px 20px; text-align: center; }
            .brand-logo-container { width: 85px; height: 85px; margin: 0 auto 20px; padding: 5px; background: white; border-radius: 22px; display: flex; align-items: center; justify-content: center; }
            .brand-logo-img { width: 100%; height: 100%; object-fit: contain; border-radius: 18px; }
            .srm-nav { padding: 10px 20px; flex: 1; }
            .srm-nav-btn { display: flex; align-items: center; gap: 15px; padding: 16px 20px; margin-bottom: 8px; border: none; background: transparent; width: 100%; border-radius: 20px; color: rgba(255,255,255,0.7); font-weight: 600; cursor: pointer; transition: var(--transition); text-align: left; }
            .srm-nav-btn.active { background: rgba(255,255,255,0.1); color: var(--srm-green); border-left: 4px solid var(--srm-green); }

            /* MAIN */
            .srm-canvas { flex: 1; padding: 40px; overflow-y: auto; scroll-behavior: smooth; }
            .welcome-card { background: linear-gradient(135deg, var(--srm-blue), #003366); color: white; padding: 30px; border-radius: 30px; margin-bottom: 30px; }

            /* STATS */
            .stats-bar { display: flex; gap: 20px; margin-bottom: 30px; }
            .stat-card { flex: 1; background: var(--card-bg); padding: 22px; border-radius: 20px; border: 1px solid var(--border-sep); display: flex; align-items: center; gap: 18px; transition: var(--transition); color: var(--text-main); }
            .stat-icon { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }

            /* LIST VIEW (UNIFORME) */
            .contract-list { background: var(--card-bg); border-radius: 25px; border: 1px solid var(--border-sep); overflow: hidden; transition: var(--transition); }
            .list-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 30px; border-bottom: 1px solid var(--border-sep); background: rgba(0,0,0,0.02); color: var(--text-main); }
            .list-item { display: flex; align-items: center; padding: 15px 30px; border-bottom: 1px solid var(--border-sep); transition: 0.2s; cursor: pointer; color: var(--text-main); }
            .list-item:hover { background: var(--item-hover); }
            .item-contract { width: 140px; font-family: monospace; font-weight: 800; color: var(--contract-color); font-size: 15px; }
            .item-info { flex: 1; }
            .item-info h4 { margin: 0; font-size: 15px; font-weight: 700; }
            .item-info p { margin: 0; font-size: 12px; color: var(--text-dim); }
            .item-modifier { width: 180px; font-size: 12px; color: var(--text-dim); }
            .item-status { width: 180px; display: flex; align-items: center; justify-content: flex-end; gap: 15px; }
            .status-pill { padding: 5px 12px; border-radius: 10px; font-size: 11px; font-weight: 800; text-transform: uppercase; }

            /* BUTTONS */
            .btn-srm-action { padding: 12px 20px; border-radius: 16px; border: none; font-weight: 700; cursor: pointer; transition: 0.3s; display: inline-flex; align-items: center; gap: 10px; font-size: 14px; }
            .btn-add { background: linear-gradient(135deg, var(--srm-green), #6fa32d); color: white; }
            .btn-import { background: linear-gradient(135deg, var(--srm-blue), #003d7a); color: white; }
            .btn-export { background: var(--card-bg); color: var(--text-main); border: 1px solid var(--border-sep); }
            .btn-srm-action:hover { transform: translateY(-2px); filter: brightness(1.1); }

            .glass-bar { background: var(--glass); backdrop-filter: blur(10px); padding: 15px 25px; border-radius: 25px; display: flex; gap: 15px; margin-bottom: 30px; align-items: center; border: 1px solid var(--border-sep); }
            .creative-input { flex: 1; border: none; background: var(--input-bg); padding: 12px 20px; border-radius: 15px; outline: none; color: var(--text-main); }

            .theme-toggle-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 10px; border-radius: 15px; cursor: pointer; margin: 0 20px 20px; font-size: 12px; }

            /* MODALS */
            .creative-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
            .creative-modal { background: var(--card-bg); padding: 30px; border-radius: 25px; width: 100%; max-width: 500px; color: var(--text-main); }
            .dark-theme input { background: var(--input-bg); color: white; border: 1px solid var(--border-sep); }
        `}</style>

        <aside className={`srm-glass-sidebar ${sidebarOpen ? 'open' : ''}`}>
             <div className="brand-box">
                 <div className="brand-logo-container"><img src="/img/logo SRM.jpeg" alt="Logo" className="brand-logo-img" /></div>
                 <h2 style={{margin:0, color: 'white', fontSize:'20px'}}>SRM Oriental</h2>
                 <p style={{fontSize:'10px', opacity:0.5}}>ADMINISTRATION</p>
             </div>
             <nav className="srm-nav">
                 <button className={`srm-nav-btn ${currentView === 'users' ? 'active' : ''}`} onClick={() => setCurrentView('users')}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    Contrats
                 </button>
                 <button className={`srm-nav-btn ${currentView === 'staff' ? 'active' : ''}`} onClick={() => setCurrentView('staff')}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    Techniciens
                 </button>
                 <button className={`srm-nav-btn ${currentView === 'audit' ? 'active' : ''}`} onClick={() => setCurrentView('audit')}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Audit
                 </button>
                 <button className={`srm-nav-btn ${currentView === 'settings' ? 'active' : ''}`} onClick={() => setCurrentView('settings')}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    Paramètres
                 </button>
             </nav>
             <button className="theme-toggle-btn" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? '☀️ Mode Clair' : '🌙 Mode Nuit'}
             </button>
        </aside>

        <main className="srm-canvas">
            <div className="welcome-card">
                <h1 style={{margin:0, fontSize: '28px'}}>Tableau de Bord Administration</h1>
                <p style={{opacity:0.8}}>Gérez les dossiers clients et l'équipe SRM l'Oriental</p>
            </div>

            {/* VUE CONTRATS (EN LISTE) */}
            {currentView === 'users' && (
                <>
                    <div className="stats-bar">
                        <div className="stat-card">
                            <div className="stat-icon" style={{background: isDarkMode ? '#1e3a8a' : '#eff6ff', color: isDarkMode ? '#93c5fd' : 'var(--srm-blue)'}}><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg></div>
                            <div><div style={{fontSize: '11px', opacity:0.6}}>TOTAL</div><div style={{fontSize: '18px', fontWeight: 800}}>{users.length}</div></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{background: isDarkMode ? '#064e3b' : '#f0fdf4', color: 'var(--srm-green)'}}><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg></div>
                            <div><div style={{fontSize: '11px', opacity:0.6}}>VÉRIFIÉS</div><div style={{fontSize: '18px', fontWeight: 800}}>{verifiedCount}</div></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{background: isDarkMode ? '#451a03' : '#fffbeb', color: '#f59e0b'}}><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
                            <div><div style={{fontSize: '11px', opacity:0.6}}>ATTENTE</div><div style={{fontSize: '18px', fontWeight: 800}}>{pendingCount}</div></div>
                        </div>
                    </div>

                    <div className="glass-bar">
                        <input className="creative-input" placeholder="Chercher un nom ou contrat..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        <button className="btn-srm-action btn-add" onClick={handleCreateUser}>+ Ajouter</button>
                        <button className="btn-srm-action btn-import" onClick={triggerImport}>Importer</button>
                        <button className="btn-srm-action btn-export" onClick={exportCSV}>Exporter</button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" style={{display:'none'}} />
                    </div>

                    <div className="contract-list">
                        <div className="list-header">
                            <div style={{width:'140px'}}>CONTRAT</div>
                            <div style={{flex:1}}>CLIENT</div>
                            <div style={{width:'180px'}}>MODIFICATEUR</div>
                            <div style={{width:'150px', textAlign:'right'}}>STATUT</div>
                        </div>
                        {filteredUsers.map(u => (
                            <div key={u.id} className="list-item" onClick={() => handleRowClick(u)}>
                                <div className="item-contract">{u.contract}</div>
                                <div className="item-info"><h4>{u.nom}</h4><p>CIN: {u.cin}</p></div>
                                <div className="item-modifier"><b>{u.lastModifiedBy || 'Système'}</b></div>
                                <div className="item-status">
                                    <span className={`status-pill ${u.phoneVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {u.phoneVerified ? 'VÉRIFIÉ' : 'ATTENTE'}
                                    </span>
                                    <button className="btn-delete" onClick={(e) => { e.stopPropagation(); handleDeleteUser(e, u.id); }}>🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* VUE TECHNICIENS */}
            {currentView === 'staff' && (
                <div className="contract-list">
                    <div className="list-header">
                        <h3 style={{margin:0}}>Équipe des Techniciens</h3>
                        <button className="btn-srm btn-primary" onClick={handleCreateStaff}>+ Nouveau Technicien</button>
                    </div>
                    {staff.map(t => (
                        <div key={t.id} className="list-item" style={{cursor:'default'}}>
                            <div style={{width:'50px', height:'50px', background:'var(--srm-blue)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', color:'white', marginRight:'20px'}}>{t.name.substring(0,2).toUpperCase()}</div>
                            <div className="item-info">
                                <h4>{t.name}</h4>
                                <p>{t.email || 'Email non renseigné'}</p>
                            </div>
                            <div className="item-modifier">
                                <b>Identifiant :</b><br/>@{t.username}
                            </div>
                            <div className="item-status">
                                <button className="btn-srm" onClick={() => handleEditStaff(t)}>Modifier</button>
                                <button className="btn-srm" style={{color:'#ef4444'}} onClick={() => handleDeleteStaff(t.id)}>🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* VUE AUDIT */}
            {currentView === 'audit' && (
                <div className="contract-list">
                    <div className="list-header"><h3>Historique d'Audit</h3></div>
                    {logs.map(log => (
                        <div key={log.id} className="list-item" style={{cursor:'default'}}>
                             <div style={{flex:1}}>
                                <span style={{fontWeight:800, color:'var(--contract-color)', fontSize:'13px'}}>{log.action}</span>
                                <p style={{fontSize:'13px', margin:'5px 0'}}>{log.details}</p>
                                <div style={{fontSize:'11px', opacity:0.6}}>Par: {log.actor} • {new Date(log.timestamp).toLocaleString()}</div>
                             </div>
                        </div>
                    ))}
                </div>
            )}

            {/* VUE PARAMETRES */}
            {currentView === 'settings' && (
                <div className="bg-white" style={{maxWidth:'500px', margin:'0 auto', padding:'40px', borderRadius:'25px', boxShadow:'0 10px 30px rgba(0,0,0,0.05)'}}>
                    <h2 style={{color:'var(--srm-blue)', marginTop:0}}>Sécurité</h2>
                    <form onSubmit={handleChangePassword}>
                        <div style={{marginBottom:'20px'}}>
                            <label style={{display:'block', marginBottom:'8px', fontWeight:600}}>Nouveau Mot de passe</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="creative-input" style={{width:'100%', boxSizing:'border-box', border:'1px solid #ddd'}} />
                        </div>
                        <button type="submit" className="btn-srm btn-primary" style={{width:'100%', justifyContent:'center'}}>Enregistrer</button>
                    </form>
                </div>
            )}
        </main>

        {/* MODAL STAFF (FORMULAIRE ENRICHI) */}
        {isStaffModalOpen && (
            <div className="creative-modal-overlay">
                <div className="creative-modal bg-white">
                    <h2 style={{marginTop:0, color: 'var(--srm-blue)'}}>Profil Technicien</h2>
                    <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                        <div>
                            <label style={{fontSize:'12px', fontWeight:'bold'}}>Nom complet</label>
                            <input className="creative-input" style={{width:'100%', boxSizing:'border-box'}} value={selectedStaff.name || ''} onChange={(e) => setSelectedStaff({...selectedStaff, name: e.target.value})} />
                        </div>
                        <div>
                            <label style={{fontSize:'12px', fontWeight:'bold'}}>Email SRM</label>
                            <input type="email" className="creative-input" style={{width:'100%', boxSizing:'border-box'}} value={selectedStaff.email || ''} onChange={(e) => setSelectedStaff({...selectedStaff, email: e.target.value})} placeholder="nom@srmoriental.ma" />
                        </div>
                        <div>
                            <label style={{fontSize:'12px', fontWeight:'bold'}}>Numéro Téléphone</label>
                            <input type="tel" className="creative-input" style={{width:'100%', boxSizing:'border-box'}} value={selectedStaff.phone || ''} onChange={(e) => setSelectedStaff({...selectedStaff, phone: e.target.value})} />
                        </div>
                        <div>
                            <label style={{fontSize:'12px', fontWeight:'bold'}}>Identifiant</label>
                            <input className="creative-input" style={{width:'100%', boxSizing:'border-box'}} value={selectedStaff.username || ''} onChange={(e) => setSelectedStaff({...selectedStaff, username: e.target.value})} />
                        </div>
                        <div>
                            <label style={{fontSize:'12px', fontWeight:'bold'}}>Mot de passe</label>
                            <input type="text" className="creative-input" style={{width:'100%', boxSizing:'border-box'}} value={selectedStaff.password || ''} onChange={(e) => setSelectedStaff({...selectedStaff, password: e.target.value})} />
                        </div>
                    </div>
                    <div style={{display:'flex', gap:'15px', marginTop:'30px'}}>
                        <button className="btn-srm" style={{flex:1, background:'#f1f5f9'}} onClick={() => setIsStaffModalOpen(false)}>Annuler</button>
                        <button className="btn-srm btn-primary" style={{flex:1}} onClick={saveStaff}>Sauvegarder</button>
                    </div>
                </div>
            </div>
        )}

        {selectedUser && (
            <UserModal user={selectedUser} mode={userModalMode} isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} currentUserRole={user?.role} currentUserName={user?.username} onSave={loadData} />
        )}
    </div>
  );
};

export default AdminPage;