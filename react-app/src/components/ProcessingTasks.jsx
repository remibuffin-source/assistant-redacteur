import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { getHomeText } from '../i18n/homeTranslations';

const ProcessingTasks = ({ selectedTasks, onTaskToggle }) => {
  const { autoSaveData } = useAssistantAutoSave();
  const userLanguage = autoSaveData.language || 'fr';
  const t = (path) => getHomeText(userLanguage, path);
  const taskOptions = [
    {
      id: 'none',
      name: t('sections.processingTasks.tasks.none'),
      icon: 'fas fa-ban',
      description: t('sections.processingTasks.tasks.none')
    },
    {
      id: 'resume',
      name: t('sections.processingTasks.tasks.resume'),
      icon: 'fas fa-compress-alt',
      description: t('sections.processingTasks.tasks.resume')
    },
    {
      id: 'develop',
      name: t('sections.processingTasks.tasks.develop'),
      icon: 'fas fa-expand-alt',
      description: t('sections.processingTasks.tasks.develop')
    },
    {
      id: 'extract',
      name: t('sections.processingTasks.tasks.extract'),
      icon: 'fas fa-search',
      description: t('sections.processingTasks.tasks.extract')
    },
    {
      id: 'correct',
      name: t('sections.processingTasks.tasks.correct'),
      icon: 'fas fa-spell-check',
      description: t('sections.processingTasks.tasks.correct')
    },
    {
      id: 'ideas',
      name: t('sections.processingTasks.tasks.ideas'),
      icon: 'fas fa-lightbulb',
      description: t('sections.processingTasks.tasks.ideas')
    },
    {
      id: 'rewrite',
      name: t('sections.processingTasks.tasks.rewrite'),
      icon: 'fas fa-edit',
      description: t('sections.processingTasks.tasks.rewrite')
    },
    {
      id: 'analyze',
      name: t('sections.processingTasks.tasks.analyze'),
      icon: 'fas fa-chart-line',
      description: t('sections.processingTasks.tasks.analyze')
    },
    {
      id: 'translate',
      name: t('sections.processingTasks.tasks.translate'),
      icon: 'fas fa-language',
      description: t('sections.processingTasks.tasks.translate')
    }
  ];

  const handleTaskToggle = (taskId) => {
    onTaskToggle(taskId);
  };

  return (
    <div className="section">
      <h3 className="section-title">
        <i className="fas fa-cogs"></i>
        {t('sections.processingTasks.title')}
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