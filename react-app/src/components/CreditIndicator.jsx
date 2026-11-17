import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import AIService from '../services/aiService';
import './CreditIndicator.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Composant pour afficher le solde de crédits et le coût estimé
 */
const CreditIndicator = ({ aiType, estimatedTokens = 1000, showEstimate = true }) => {
  const { user } = useAuth();
  const [credits, setCredits] = useState(null);
  const [estimatedCost, setEstimatedCost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCredits();
  }, []);

  useEffect(() => {
    if (showEstimate && aiType) {
      estimateCost();
    }
  }, [aiType, estimatedTokens, showEstimate]);

  const fetchCredits = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/credits/balance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
      }
    } catch (error) {
      console.error('Erreur récupération crédits:', error);
    } finally {
      setLoading(false);
    }
  };

  const estimateCost = async () => {
    try {
      const cost = await AIService.estimateCost(aiType, estimatedTokens);
      setEstimatedCost(cost);
    } catch (error) {
      console.error('Erreur estimation coût:', error);
    }
  };

  if (loading || !credits) {
    return null;
  }

  const balance = credits.balance || 0;
  const isLow = balance < 50;
  const isCritical = balance < 10;

  return (
    <div className={`credit-indicator ${isLow ? 'low' : ''} ${isCritical ? 'critical' : ''}`}>
      <div className="credit-balance">
        <span className="credit-icon">💰</span>
        <span className="credit-amount">{balance.toFixed(2)}</span>
        <span className="credit-label">crédits</span>
      </div>

      {showEstimate && estimatedCost && (
        <div className="credit-estimate">
          <span className="estimate-label">Coût estimé :</span>
          <span className="estimate-amount">{estimatedCost.toFixed(2)} crédits</span>
        </div>
      )}

      {isLow && (
        <div className="credit-warning">
          <span className="warning-icon">⚠️</span>
          <span className="warning-text">
            {isCritical ? 'Crédits presque épuisés !' : 'Crédits faibles'}
          </span>
          <button 
            className="recharge-button"
            onClick={() => window.location.href = '/subscription'}
          >
            Recharger
          </button>
        </div>
      )}
    </div>
  );
};

export default CreditIndicator;
