const { default: mongoose } = require('mongoose');
const Task = require('../models/task');
const Project = require('../models/project');
const User = require('../models/user');

// Function to get all tasks
async function getAllTasks(req, res) {
   let tasks;
   try {
    tasks = await Task.find();
   } catch (err) {
    res.status(500).json({ message: err.message });   
   }
    res.status(200).json({ tasks: tasks.map((tasks) => tasks.toObject({ getters: true })) });
}

// Function to get a task by id
async function getTaskById(req, res) {
    const taskId = req.params.tid;

    let task
    try {
        task = await Task.findById(taskId);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }

    if (!task) {
        res.status(404).json({ message: 'Task not found' });
    } 
    res.status(200).json({ task: task });
}

// Function to create a task
async function createTask(req, res, next) {
    const task = new Task({
        title: req.body.title,
        description: req.body.description,
        dueDate: req.body.dueDate,
        completed: req.body.completed,
        projectId: req.body.project,
        userId: req.body.user
    });

    // Verifies that the project id and user id is valid
    let project;
    let user;
    try {
        project = await Project.findById(req.body.projectId);
        user = await User.findById(req.body.userId);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }

    if (!project || !user) {
        res.status(404).json({ message: 'Project or user not found' });
    }

    try {
        // Save the task to the database
        // Session is used to store the project id and user id
        const sess = await mongoose.startSession();
        sess.startTransaction();
        // Save to task collection
        await task.save({ session: sess });
        // Save to project collection
        await project.tasks.push(task);
        await project.save({ session: sess });
        // Save to user collection
        await user.tasks.push(task);
        await user.save({ session: sess });
        // Commit the transaction
        await sess.commitTransaction();
    } catch (err) {
        const error = new Error(err, 500);
        return next(error);
    }
    res.status(201).json({ task: task });
}

// Function to delete a task
async function deleteTask(req, res) {
    const taskId = req.params.tid

    let task;
    try {
        task = await Task.findById(taskId);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }

    if(!task) {
        res.status(404).json({ message: 'Task not found' });
    }

    try { 
        await Task.deleteOne({ _id: taskId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }

    res.status(200).json({ message: 'Task deleted' });
}

// Function to edit a task
async function editTask(req, res) {
    const taskId = req.params.tid;

    let task;
    try {
        task = await Task.findById(taskId);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }

    if(!task) {
        res.status(404).json({ message: 'Task not found' });
    } 

    task.title = req.body.title;
    task.description = req.body.description;
    task.dueDate = req.body.dueDate;
    task.completed = req.body.completed;

    try {
        await task.save();
    } catch (err) { 
        res.status(500).json({ message: err.message });
    }
    res.status(200).json({ updatedTask: task });
}

// Export functions
module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    deleteTask,
    editTask
}