import React from 'react';
import { useLocation } from 'react-router-dom';
import ContentCalendar from './ContentCalendar/ContentCalendar';

// Ce composant sert de "page" pour envelopper notre calendrier.
function CalendarPage() {
  const location = useLocation();
  const editorData = location.state; // Données provenant de l'éditeur
  
  return (
    <div>
      {/* Optionnel : Vous pouvez ajouter un titre à la page ici */}
      {/* <h1>Mon Calendrier de Contenu</h1> */}
      <ContentCalendar editorData={editorData} />
    </div>
  );
}

export default CalendarPage;