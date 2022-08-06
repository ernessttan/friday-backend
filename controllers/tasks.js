const Task = require('../models/task');
const Project = require('../models/project');
const User = require('../models/user');
const mongoose = require('mongoose');

// Function to get all tasks
async function getAllTasksByUserId(req, res, next) {
   const userId = req.params.uid;

   let userTasks;
   try {
    userTasks = await User.findById(userId).populate('tasks');
   } catch (err) {
    const error = new Error('Error getting tasks', 500);
    return next(error);
   }

   if(!userTasks || userTasks.length === 0) {
       const error = new Error(`User with id ${userId} does not have any tasks`, 404);
       return next(error);
   }
   res.status(200).json({ tasks: userTasks.tasks.map(task => task.toObject({ getters: true })) });
}

// Function to get all task by project id
async function getAllTasksByProjectId(req, res, next) {
    const projectId = req.params.pid;

    let projectTasks;
    try {
        projectTasks = await Project.findById(projectId).populate('tasks');
    } catch (err) {
        const error = new Error('Error getting tasks', 500);
        return next(error);
    }

    if(!projectTasks || projectTasks.length === 0) {
        const error = new Error(`Project with id ${projectId} does not have any tasks`, 404);
        return next(error);
    }
    res.status(200).json({ project: projectTasks, tasks: projectTasks.tasks.map(task => task.toObject({ getters: true })) });
}

// Function to get a task by id
async function getTaskById(req, res, next) {
    const taskId = req.params.tid;

    let task;
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
    const {title, description, dueDate, completed, status, projectId, userId} = req.body;
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

        const task = new Task({
            title,
            description,
            dueDate,
            completed,
            status,
            projectId,
            projectTitle: project.title,
            userId
        });

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
            userId,
            status
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
async function editTask(req, res, next) {
    const taskId = req.params.tid;

    let task;
    try {
        task = await Task.findById(taskId);
    } catch (err) {
       const error = new Error('Could not find task', 500);
       return next(error);
    }
    
    if(!task) {
        res.status(404).json({ message: 'Task not found' });
    }

    if (req.body.projectId) {
        let project;
        try {
            project = await Project.findById(req.body.projectId);
        } catch (err) {
            const error = new Error('Could not find project', 500);
            return next(error);
        }

        if (!project) {
            res.status(404).json({ message: 'Project not found' });
        } 
        task.projectTitle = project.title;
        task.projectId = req.body.projectId;
    }

    task.title = req.body.title;
    task.description = req.body.description;
    task.dueDate = req.body.dueDate;
    task.dueDate = req.body.dueDate;
    task.completed = req.body.completed;
    task.status = req.body.status;

    try {
        await task.save();
    } catch (err) { 
        const error = new Error('Could not update task', 500);
        return next(error);
    }
    res.status(200).json({ updatedTask: task.toObject({ getters: true }) });
}

// Export functions
module.exports = {
    getAllTasksByUserId,
    getAllTasksByProjectId,
    getTaskById,
    createTask,
    deleteTask,
    editTask
}