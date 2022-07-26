const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create a schema for a user
const userSchema = new Schema({
    username: { type: String, required:true },
    email: { type: String, required:true },
    password: { type: String, required:true },
    tasks: [{ type: mongoose.Types.ObjectId, ref: 'Task' }],
    projects: [{ type: mongoose.Types.ObjectId, ref: 'Project' }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;