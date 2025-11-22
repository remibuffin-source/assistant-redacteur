import mongoose from 'mongoose';

const SocialAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platform: {
    type: String,
    enum: ['twitter', 'facebook', 'instagram', 'linkedin', 'youtube', 'tiktok'],
    required: true
  },
  accountId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },
  stats: {
    successCount: { type: Number, default: 0 },
    failCount: { type: Number, default: 0 },
    lastPublishedAt: { type: Date }
  }
}, {
  timestamps: true
});

SocialAccountSchema.methods.updateStats = async function ({ success }) {
  if (success) {
    this.stats.successCount += 1;
  } else {
    this.stats.failCount += 1;
  }
  this.stats.lastPublishedAt = new Date();
  await this.save();
};

const SocialAccount = mongoose.model('SocialAccount', SocialAccountSchema);
export default SocialAccount;
