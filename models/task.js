const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create a schema for our data
const taskSchema = new Schema({
    title: { type: String, required:true },
    description: { type: String, required:true },
    dueDate: { type: String, required:true },
    completed: { type: Boolean }
});

// Create a model for our data
const Task = mongoose.model('Task', taskSchema);

// Export the model
module.exports = Task;
