const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create a schema for a project
const projectSchema = new Schema({
    title: { type: String, required:true },
    description: { type: String },
    tasks: [{ type: mongoose.Types.ObjectId, ref: 'Task' }],
    userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;