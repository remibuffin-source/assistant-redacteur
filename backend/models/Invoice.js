import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  invoiceNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'invoice_number'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  userEmail: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'user_email'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  amountTTC: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'amount_ttc'
  },
  tva: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'stripe',
    field: 'payment_method'
  },
  paymentIntentId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'payment_intent_id'
  },
  status: {
    type: DataTypes.ENUM('paid', 'pending', 'cancelled', 'refunded'),
    allowNull: false,
    defaultValue: 'paid'
  },
  items: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  htmlContent: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    field: 'html_content'
  },
  filePath: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'file_path'
  },
  invoiceDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'invoice_date'
  }
}, {
  tableName: 'invoices',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Invoice;
