import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  customField: { type: String, default: '' },
  image: { type: String },
  drafts: [{
    draft: String,
    createdAt: { type: Date, default: Date.now },
    fileId: { type: String, default: null }, 
  }],
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;