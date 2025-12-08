const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, default: 'admin' },
    md5Hash: String,
    sha1Hash: String,
    bcryptHash: String,
    argon2Hash: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);