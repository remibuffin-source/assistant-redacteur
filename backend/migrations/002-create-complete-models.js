/**
 * Migration: Créer les tables complete_models et complete_model_files
 */

export const up = async (queryInterface, Sequelize) => {
  // Créer la table complete_models
  await queryInterface.createTable('complete_models', {
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
    description: {
      type: Sequelize.STRING(500),
      allowNull: true
    },
    config: {
      type: Sequelize.JSON,
      allowNull: false
    },
    content: {
      type: Sequelize.TEXT('long'),
      allowNull: true
    },
    results: {
      type: Sequelize.JSON,
      allowNull: true
    },
    theme: {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'light'
    },
    tags: {
      type: Sequelize.JSON,
      allowNull: true
    },
    category: {
      type: Sequelize.STRING(100),
      allowNull: true
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
    is_favorite: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
  await queryInterface.addIndex('complete_models', ['user_id']);
  await queryInterface.addIndex('complete_models', ['user_id', 'created_at']);
  await queryInterface.addIndex('complete_models', ['category']);
  await queryInterface.addIndex('complete_models', ['is_favorite']);

  // Créer la table complete_model_files
  await queryInterface.createTable('complete_model_files', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    complete_model_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'complete_models',
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
  await queryInterface.addIndex('complete_model_files', ['complete_model_id']);
  await queryInterface.addIndex('complete_model_files', ['file_type']);
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('complete_model_files');
  await queryInterface.dropTable('complete_models');
};
