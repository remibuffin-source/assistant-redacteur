import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import './AdminCreditsPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const AdminCreditsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
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
    <div className="admin-credits-page">
      <h1>🎯 Gestion des Crédits</h1>
      
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

      {/* Ajouter des crédits */}
      <div className="add-credits-section">
        <h2>➕ Ajouter des Crédits</h2>
        <form onSubmit={handleAddCredits}>
          <div className="form-group">
            <label>Utilisateur</label>
            <select 
              value={selectedUser?.email || ''} 
              onChange={(e) => setSelectedUser(users.find(u => u.email === e.target.value))}
              required
            >
              <option value="">Sélectionner un utilisateur</option>
              {users.map(u => (
                <option key={u.id} value={u.email}>
                  {u.email} - {u.balance.toFixed(0)} crédits
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Montant (crédits)</label>
            <input 
              type="number" 
              value={addCreditsAmount}
              onChange={(e) => setAddCreditsAmount(e.target.value)}
              placeholder="400"
              min="1"
              step="1"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description (optionnel)</label>
            <input 
              type="text" 
              value={addCreditsDescription}
              onChange={(e) => setAddCreditsDescription(e.target.value)}
              placeholder="Bonus de bienvenue, compensation, etc."
            />
          </div>
          
          <button type="submit" className="btn-primary">
            Ajouter les crédits
          </button>
        </form>
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
  );
};

export default AdminCreditsPage;
