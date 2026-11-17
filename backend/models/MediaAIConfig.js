import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

class MediaAIConfig extends Model {
  /**
   * Récupérer la configuration globale des IA multimodales
   */
  static async getConfig() {
    try {
      const config = await this.findOne({
        where: { config_key: 'media_ai_config' }
      });
      
      if (!config) {
        // Configuration par défaut si rien en base
        return {
          text: 'gpt-4o-mini',
          audio: 'whisper-large-v3',
          image: 'gemini-2.5-flash',
          spreadsheet: 'gpt-4o',
          web: 'claude-4.5-sonnet'
        };
      }
      
      return JSON.parse(config.config_value);
    } catch (error) {
      console.error('Erreur récupération config IA multimodale:', error);
      // Retourner config par défaut en cas d'erreur
      return {
        text: 'gpt-4o-mini',
        audio: 'whisper-large-v3',
        image: 'gemini-2.5-flash',
        spreadsheet: 'gpt-4o',
        web: 'claude-4.5-sonnet'
      };
    }
  }
  
  /**
   * Sauvegarder la configuration (admin uniquement)
   */
  static async saveConfig(configData, adminUserId) {
    try {
      const [config, created] = await this.findOrCreate({
        where: { config_key: 'media_ai_config' },
        defaults: {
          config_value: JSON.stringify(configData),
          updated_by: adminUserId
        }
      });
      
      if (!created) {
        config.config_value = JSON.stringify(configData);
        config.updated_by = adminUserId;
        await config.save();
      }
      
      return config;
    } catch (error) {
      console.error('Erreur sauvegarde config IA multimodale:', error);
      throw error;
    }
  }
}

MediaAIConfig.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    config_key: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    config_value: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'MediaAIConfig',
    tableName: 'media_ai_config',
    timestamps: false
  }
);

export default MediaAIConfig;
