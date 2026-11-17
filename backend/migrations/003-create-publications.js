/**
 * Migration: Créer les tables publications et publication_files
 */

export const up = async (queryInterface, Sequelize) => {
  // Créer la table publications
  await queryInterface.createTable('publications', {
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
    title: {
      type: Sequelize.STRING(200),
      allowNull: false
    },
    content: {
      type: Sequelize.TEXT('long'),
      allowNull: false
    },
    publish_date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    platforms: {
      type: Sequelize.JSON,
      allowNull: false
    },
    status: {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'draft'
    },
    settings: {
      type: Sequelize.JSON,
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
    performance: {
      type: Sequelize.JSON,
      allowNull: true
    },
    source: {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'manual'
    },
    source_id: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    history: {
      type: Sequelize.JSON,
      allowNull: true
    },
    advanced: {
      type: Sequelize.JSON,
      allowNull: true
    },
    published_at: {
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
  await queryInterface.addIndex('publications', ['user_id']);
  await queryInterface.addIndex('publications', ['user_id', 'publish_date']);
  await queryInterface.addIndex('publications', ['status']);
  await queryInterface.addIndex('publications', ['publish_date']);
  await queryInterface.addIndex('publications', ['category']);

  // Créer la table publication_files
  await queryInterface.createTable('publication_files', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    publication_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'publications',
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
    thumbnail: {
      type: Sequelize.STRING(500),
      allowNull: true
    },
    display_order: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    alt_text: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    caption: {
      type: Sequelize.TEXT,
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
  await queryInterface.addIndex('publication_files', ['publication_id']);
  await queryInterface.addIndex('publication_files', ['file_type']);
  await queryInterface.addIndex('publication_files', ['publication_id', 'display_order']);
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('publication_files');
  await queryInterface.dropTable('publications');
};
