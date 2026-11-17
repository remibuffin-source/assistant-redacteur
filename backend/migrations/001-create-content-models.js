/**
 * Migration: Créer les tables content_models et content_model_files
 */

export const up = async (queryInterface, Sequelize) => {
  // Créer la table content_models
  await queryInterface.createTable('content_models', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    name: {
      type: Sequelize.STRING(200),
      allowNull: false
    },
    content: {
      type: Sequelize.TEXT('long'),
      allowNull: false,
      defaultValue: ''
    },
    type: {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'text'
    },
    description: {
      type: Sequelize.STRING(500),
      allowNull: true
    },
    tags: {
      type: Sequelize.JSON,
      allowNull: true
    },
    category: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    is_template: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    usage_count: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    last_used_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
    }
  });

  // Ajouter les index
  await queryInterface.addIndex('content_models', ['user_id']);
  await queryInterface.addIndex('content_models', ['user_id', 'created_at']);
  await queryInterface.addIndex('content_models', ['category']);
  await queryInterface.addIndex('content_models', ['is_template']);

  // Créer la table content_model_files
  await queryInterface.createTable('content_model_files', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    content_model_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'content_models',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    filename: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    original_name: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    file_path: {
      type: Sequelize.STRING(500),
      allowNull: false
    },
    file_size: {
      type: Sequelize.BIGINT,
      allowNull: false
    },
    mime_type: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    file_type: {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'document'
    },
    metadata: {
      type: Sequelize.JSON,
      allowNull: true
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
    }
  });

  // Ajouter les index
  await queryInterface.addIndex('content_model_files', ['content_model_id']);
  await queryInterface.addIndex('content_model_files', ['file_type']);
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('content_model_files');
  await queryInterface.dropTable('content_models');
};
