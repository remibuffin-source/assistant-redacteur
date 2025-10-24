// Version JavaScript pur sans React
document.addEventListener('DOMContentLoaded', function() {
  const app = document.getElementById('root');

  if (app) {
    app.innerHTML = `
      <div style="
        background-color: #f0f0f0;
        min-height: 100vh;
        padding: 20px;
        font-family: Arial, sans-serif;
      ">
        <div style="
          max-width: 800px;
          margin: 0 auto;
          background-color: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          text-align: center;
        ">
          <h1 style="color: #4CAF50; margin-bottom: 20px;">
            🎉 Assistant Rédactionnel - JavaScript Pur !
          </h1>

          <p style="font-size: 1.2rem; color: #666; margin-bottom: 30px;">
            Test réussi ! JavaScript fonctionne parfaitement sans React.
          </p>

          <div style="
            background-color: #e8f5e8;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #4CAF50;
            margin-bottom: 30px;
          ">
            <h2 style="color: #2E7D32; margin: 0 0 10px 0;">✅ Test Réussi</h2>
            <p style="margin: 0; color: #2E7D32;">
              Le DOM JavaScript fonctionne parfaitement !
            </p>
          </div>

          <button onclick="alert('JavaScript fonctionne !')"
            style="
              background-color: #2196F3;
              color: white;
              border: none;
              padding: 15px 30px;
              border-radius: 8px;
              font-size: 1.1rem;
              cursor: pointer;
              font-weight: bold;
            ">
            🧪 Tester JavaScript
          </button>
        </div>
      </div>
    `;

    console.log('✅ Application JavaScript chargée avec succès !');
  } else {
    console.error('❌ Élément #root non trouvé');
  }
});