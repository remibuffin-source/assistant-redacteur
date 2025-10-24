// src/components/StripePayment.jsx
import React, { useState } from 'react';
import { useStripe, useElements, Elements, CardElement } from '@stripe/react-stripe-js';
import { stripePromise } from '../utils/stripe';
import './StripePayment.css';

const CheckoutForm = ({ amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe) {
      setMessage('❌ Stripe n\'est pas chargé.');
      return;
    }

    setIsProcessing(true);
    setMessage('');

    try {
      // Créer un PaymentIntent
      const response = await fetch('http://localhost:3005/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          userEmail: 'test@example.com' // À remplacer par l'email réel de l'utilisateur
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du paiement');
      }

      const { clientSecret } = await response.json();

      // Confirmer le paiement avec Stripe Elements
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        setMessage('✅ Paiement réussi ! Votre solde a été rechargé.');
        if (onSuccess) onSuccess(amount);
      }

    } catch (error) {
      setMessage('❌ Erreur lors du paiement. Veuillez réessayer.');
      if (onError) onError(error);
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <div className="card-element-container">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="stripe-payment-btn"
      >
        {isProcessing ? (
          <>
            <div className="loader"></div>
            Traitement...
          </>
        ) : (
          <>
            <i className="fas fa-credit-card"></i>
            Payer {amount}€
          </>
        )}
      </button>
    </form>
  );
};

const StripePayment = ({ amount, onSuccess, onError, onCancel }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
};

export default StripePayment;
