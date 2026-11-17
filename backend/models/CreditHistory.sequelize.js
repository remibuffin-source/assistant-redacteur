import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

class CreditHistory extends Model {}

CreditHistory.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('purchase', 'usage', 'refund', 'bonus', 'adjustment'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  balanceAfter: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  relatedTo: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'CreditHistory',
  tableName: 'credit_history',
  timestamps: true,
  updatedAt: false, // Pas besoin de updatedAt pour l'historique
  indexes: [
    { fields: ['userId', 'createdAt'] },
    { fields: ['type'] }
  ]
});

export default CreditHistory;
