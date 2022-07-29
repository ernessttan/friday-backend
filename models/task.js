const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create a schema for a task
const taskSchema = new Schema({
    title: { type: String, required:true },
    description: { type: String },
    dueDate: { type: String },
    completed: { type: Boolean, required:true },
    status: { type: String, required:true },
    projectId: { type: mongoose.Types.ObjectId, ref: 'Project' },
    userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
});

// Create a model for our data
const Task = mongoose.model('Task', taskSchema);

// Export the model
module.exports = Task;