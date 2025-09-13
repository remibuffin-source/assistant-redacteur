const ProcessingTasks = ({ selectedTasks, onTaskToggle }) => {
  const taskOptions = [
    {
      id: 'resume',
      name: 'Résumer',
      icon: 'fas fa-compress-alt',
      description: 'Résumer le contenu'
    },
    {
      id: 'develop',
      name: 'Développer',
      icon: 'fas fa-expand-alt',
      description: 'Développer le contenu'
    },
    {
      id: 'extract',
      name: 'Extraire arguments',
      icon: 'fas fa-search',
      description: 'Extraire les arguments clés'
    },
    {
      id: 'correct',
      name: 'Corriger',
      icon: 'fas fa-spell-check',
      description: 'Corriger les erreurs'
    },
    {
      id: 'ideas',
      name: 'Idées supplémentaires',
      icon: 'fas fa-lightbulb',
      description: 'Générer des idées supplémentaires'
    },
    {
      id: 'rewrite',
      name: 'Réécriture',
      icon: 'fas fa-edit',
      description: 'Réécrire le contenu'
    },
    {
      id: 'analyze',
      name: 'Analyse',
      icon: 'fas fa-chart-line',
      description: 'Analyser le contenu'
    },
    {
      id: 'translate',
      name: 'Traduction',
      icon: 'fas fa-language',
      description: 'Traduire le contenu'
    }
  ];

  const handleTaskToggle = (taskId) => {
    onTaskToggle(taskId);
  };

  return (
    <div className="section">
      <h3 className="section-title">
        <i className="fas fa-cogs"></i>
        Tâches de Traitement Intelligent
      </h3>
      
      <div className="task-grid-original">
        {taskOptions.map((task) => (
          <button
            key={task.id}
            className={`task-btn-original ${selectedTasks.includes(task.id) ? 'selected' : ''}`}
            onClick={() => handleTaskToggle(task.id)}
            data-task={task.id}
            title={task.description}
          >
            <i className={task.icon}></i>
            <span>{task.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProcessingTasks;