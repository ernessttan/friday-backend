const Task = require('../models/task');
const Project = require('../models/project');
const User = require('../models/user');
const mongoose = require('mongoose');

// Function to get all tasks
async function getAllTasks(req, res, next) {
   let tasks;
   try {
    tasks = await Task.find();
   } catch (err) {
    const error = new Error('Could not get tasks', 500);
    return next(error);
   }
    res.status(200).json({ tasks: tasks.map((tasks) => tasks.toObject({ getters: true })) });
}

// Function to get a task by id
async function getTaskById(req, res, next) {
    const taskId = req.params.tid;

    let task
    try {
        task = await Task.findById(taskId);
    } catch (err) {
       const error = new Error('Could not find task', 500);
       return next(error);
    }

    if (!task) {
        const error = new Error(`Task with id ${taskId} not found`, 404);
        return next(error);
    }
    res.status(200).json({ task: task.toObject({ getters: true }) });
}

// Function to create a task
async function createTask(req, res, next) {
    const {title, description, dueDate, completed, projectId, userId} = req.body;
    // Verify that the user exists
    let user;
    try {
        user = await User.findById(req.body.userId);
    } catch (err) {
        const error = new Error('Could not find user', 500);
        return next(error);
    }

    // If user selected an existing project, add the task to the project
    if (projectId) {
        const task = new Task({
            title,
            description,
            dueDate,
            completed,
            projectId,
            userId
        });

        // Validate that the project exists
        let project;
        try {
            project = await Project.findById(req.body.projectId);
        } catch (err) {
            const error = new Error('Could not find project', 500);
            return next(error);
        } 

        if (!project) {
            const error = new Error(`Project with id ${req.body.projectId} not found`, 404);
            return next(error);
        }

        // Save to database
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            // Save to task collection
            await task.save({ session: sess });
            // Save task to project
            project.tasks.push(task);
            await project.save({ session: sess });
            // Save task to user
            user.tasks.push(task);
            await user.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err.message);
            const error = new Error(`Could not create task, please try again`, 500);
            return next(error);
        }
    } else {
        const task = new Task({
            title,
            description,
            dueDate,
            completed,
            userId
        });

        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            // Save to task collection
            await task.save({ session: sess });
            user.tasks.push(task);
            await user.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            const error = new Error(`Could not create task: ${err.message}`, 500);
            return next(error);
        }
    }
    res.status(201).json({ message: 'Task created' });
}

// Function to delete a task
async function deleteTask(req, res, next) {
    const taskId = req.params.tid

    let existingTask;
    try {
        existingTask = await Task.findById(taskId).populate('projectId').populate('userId');
    } catch (err) {
        const error = new Error('Could not find task', 500);
        return next(error);
    }

    // Validate the task exists
    if(!existingTask) {
        const error = new Error(`Task with id ${taskId} not found`, 404);
        return next(error);
    }

    // Delete the task
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await existingTask.remove({ session: sess });
        // Remove task from project if a was selected
        if (existingTask.projectId) {
            // Removes task id from project's task array
            existingTask.projectId.tasks.pull(existingTask);
            // Save updated project
            existingTask.projectId.save({ session: sess });
            // Removes task id from user's task array
            existingTask.userId.tasks.pull(existingTask);
            // Save updated user
            await existingTask.userId.save({ session: sess });
        }
        existingTask.userId.tasks.pull(existingTask);
        await existingTask.userId.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new Error('Could not delete task', 500);
        return next(error);
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