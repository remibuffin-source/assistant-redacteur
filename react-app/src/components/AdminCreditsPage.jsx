import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import MenuBar from './MenuBar';
import './AdminCreditsPage.css';
import './ConfigAPIPage.css'; // Pour utiliser les styles de la sidebar admin

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const AdminCreditsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [addCreditsAmount, setAddCreditsAmount] = useState('');
  const [addCreditsDescription, setAddCreditsDescription] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Récupérer les statistiques globales
      const statsResponse = await fetch(`${API_BASE_URL}/credits/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }
      
      // Récupérer la liste des utilisateurs
      const usersResponse = await fetch(`${API_BASE_URL}/credits/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users);
      }
      
      // Récupérer les ventes mensuelles
      const salesResponse = await fetch(`${API_BASE_URL}/credits/admin/monthly-sales`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (salesResponse.ok) {
        const salesData = await salesResponse.json();
        setMonthlySales(salesData.sales || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredits = async (e) => {
    e.preventDefault();
    
    if (!selectedUser || !addCreditsAmount || parseFloat(addCreditsAmount) <= 0) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un utilisateur et entrer un montant valide' });
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/credits/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUser.email,
          amount: parseFloat(addCreditsAmount),
          type: 'bonus',
          description: addCreditsDescription || `Ajout manuel par admin`
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: `✅ ${addCreditsAmount} crédits ajoutés à ${selectedUser.email}` });
        setAddCreditsAmount('');
        setAddCreditsDescription('');
        setSelectedUser(null);
        fetchAdminData(); // Recharger les données
      } else {
        setMessage({ type: 'error', text: `❌ ${data.error || 'Erreur lors de l\'ajout'}` });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: '❌ Erreur de connexion' });
    }
  };

  if (loading) {
    return (
      <div className="admin-credits-page">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <MenuBar onHelp={() => {}} />
      <div className="page-content" style={{paddingTop: '20px', paddingLeft: '5px', paddingRight: '30px'}}>
        <div className="admin-page-layout">
        {/* Sidebar de navigation */}
        <div className="admin-sidebar">
          <div className="admin-sidebar-header">
            <h2>⚙️ Administration</h2>
          </div>
          <nav className="admin-nav">
            <button 
              className="admin-nav-btn"
              onClick={() => navigate('/config-api')}
            >
              <i className="fas fa-key"></i>
              <span>Clés API</span>
            </button>
            <button 
              className="admin-nav-btn"
              onClick={() => navigate('/config-api?tab=prompt-builder')}
            >
              <i className="fas fa-cogs"></i>
              <span>Prompt Builder</span>
            </button>
            <button 
              className="admin-nav-btn"
              onClick={() => navigate('/admin-pricing')}
            >
              <i className="fas fa-dollar-sign"></i>
              <span>Tarification</span>
            </button>
            <button 
              className="admin-nav-btn active"
              onClick={() => navigate('/admin-credits')}
            >
              <i className="fas fa-credit-card"></i>
              <span>Souscriptions</span>
            </button>
          </nav>
        </div>

        {/* Contenu principal */}
        <div className="admin-main-content">
          <div className="admin-credits-page">
            <h1>💳 Souscriptions</h1>
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Statistiques globales */}
      {stats && (
        <div className="stats-section">
          <h2>📊 Statistiques Globales</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Utilisateurs</div>
              <div className="stat-value">{stats.users.total}</div>
              <div className="stat-sublabel">{stats.users.withCredits} avec crédits</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-label">Crédits Totaux</div>
              <div className="stat-value">{stats.credits.totalPurchased?.toFixed(0) || 0}</div>
              <div className="stat-sublabel">achetés</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-label">Crédits Utilisés</div>
              <div className="stat-value">{stats.credits.totalUsed?.toFixed(0) || 0}</div>
              <div className="stat-sublabel">consommés</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-label">Crédits Restants</div>
              <div className="stat-value">{stats.credits.totalBalance?.toFixed(0) || 0}</div>
              <div className="stat-sublabel">disponibles</div>
            </div>
          </div>

          {stats.topServices && stats.topServices.length > 0 && (
            <div className="top-services">
              <h3>🔥 Services les plus utilisés</h3>
              <div className="services-list">
                {stats.topServices.map((service, index) => (
                  <div key={index} className="service-item">
                    <span className="service-name">{service._id}</span>
                    <span className="service-stats">
                      {service.count} utilisations • {service.totalCredits.toFixed(1)} crédits
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ventes mensuelles */}
      <div className="monthly-sales-section">
        <h2>📈 Ventes de Crédits par Mois</h2>
        {monthlySales.length > 0 && (
          <div className="sales-summary">
            <div className="summary-card">
              <i className="fas fa-coins"></i>
              <div>
                <span className="summary-label">Total Crédits Vendus</span>
                <span className="summary-value">
                  {monthlySales.reduce((sum, sale) => sum + sale.credits, 0).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="summary-card">
              <i className="fas fa-shopping-cart"></i>
              <div>
                <span className="summary-label">Total Transactions</span>
                <span className="summary-value">
                  {monthlySales.reduce((sum, sale) => sum + sale.transactions, 0)}
                </span>
              </div>
            </div>
            <div className="summary-card">
              <i className="fas fa-chart-line"></i>
              <div>
                <span className="summary-label">Mois Actifs</span>
                <span className="summary-value">{monthlySales.length}</span>
              </div>
            </div>
          </div>
        )}
        {monthlySales.length > 0 ? (
          <div className="sales-chart">
            <div className="chart-bars">
              {monthlySales.map((sale, index) => {
                const maxCredits = Math.max(...monthlySales.map(s => s.credits));
                const heightPercent = (sale.credits / maxCredits) * 100;
                
                return (
                  <div key={index} className="chart-bar-container">
                    <div className="chart-bar-wrapper">
                      <div 
                        className="chart-bar" 
                        style={{ height: `${heightPercent}%` }}
                        title={`${sale.credits.toLocaleString()} crédits`}
                      >
                        <span className="bar-value">{sale.credits.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="chart-label">{sale.month}</div>
                    <div className="chart-sublabel">{sale.transactions} ventes</div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="sales-chart">
            <p>Aucune vente enregistrée pour le moment</p>
          </div>
        )}
      </div>

      {/* Liste des utilisateurs */}
      <div className="users-section">
        <h2>👥 Utilisateurs ({users.length})</h2>
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Nom</th>
                <th>Langue</th>
                <th>Solde</th>
                <th>Total Acheté</th>
                <th>Total Utilisé</th>
                <th>Dernière Recharge</th>
                <th>Inscription</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.name}</td>
                  <td>
                    <span className="language-badge">
                      {u.language ? u.language.toUpperCase() : 'FR'}
                    </span>
                  </td>
                  <td className="credit-balance">{u.balance.toFixed(0)}</td>
                  <td>{u.totalPurchased.toFixed(0)}</td>
                  <td>{u.totalUsed.toFixed(0)}</td>
                  <td>{u.lastRecharge ? new Date(u.lastRecharge).toLocaleDateString() : '-'}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCreditsPage;
