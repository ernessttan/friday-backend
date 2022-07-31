const Project = require('../models/project');
const User = require('../models/user');
const Task = require('../models/task');
const mongoose = require('mongoose');

async function getAllProjectsByUserId(req, res, next) {
    const userId = req.params.uid;

    let userProjects
    try {
        userProjects = await User.findById(userId).populate('projects'); 
    } catch (err) {
        const error = new Error('Error getting projects', 500);
        return next(error);
    }

    if (!userProjects || userProjects.length === 0) {
        const error = new Error(`User with id ${userId} does not have any projects`, 404);
        return next(error);
    }
    res.status(200).json({ projects: userProjects.projects.map(project => project.toObject({ getters: true })) });
}

async function getProjectById(req, res, next) {
    const projectId = req.params.pid;
    console.log(projectId);

    let project;
    try {
        project = await Project.findById(projectId);
    } catch (err) {
        const error = new Error('Could not get project', 500);
        return next(error);
    }
    
    if(!project) {
        const error = new Error(`Could not get project with an id of ${projectId}`, 404);
        return next(error);
    }
    res.status(200).json({ project: project.toObject({ getters: true }) });
}

async function createProject(req, res, next) {
    const project = new Project({
        title: req.body.title,
        description: req.body.description,
        tasks: [],
        userId: req.body.userId
    });

    let user;
    try {
        user = await User.findById(req.body.userId);
    } catch (err) {
        const error = new Error(`Creating project failed, please try again.`, 500);
        return next(error);
    }

    if (!user) {
        const error = new Error(`Could not find user for provided id ${req.body.userId}`, 404);
        return next(error);
    }

    try {
        const sess= await mongoose.startSession();
        sess.startTransaction();
        await project.save({ session: sess });
        user.projects.push(project);
        await user.save({ session: sess });
        await sess.commitTransaction();

    } catch (err) {
        const error = new Error(`Creating project failed, please try again.`, 500);
        return next(error);
    }
    res.status(201).json({ project: project });
}

async function deleteProject(req, res, next) {
    const projectId = req.params.pid;

    // Validate that the project exists
    let existingProject;
    try {
        existingProject = await Project.findById(projectId).populate('tasks').populate('userId');
    } catch (err) {
        const error = new Error(`Something went wrong, could not delete project`, 500);
        return next(error);
    }

    if (!existingProject) {
        const error = new Error(`Could not find project with an id of ${projectId}`, 404);
        return next(error);
    }

    // Validate that the logged in user is allowed to delete a project
    // if (existingProject.userId !== req.userData.userId) {
    //     const error = new Error(`You are not authorized to delete this project`, 401);
    //     return next(error);
    // }

    try {
        const sess= await mongoose.startSession();
        sess.startTransaction();
        await existingProject.remove({ session: sess });
        // Remove project from user
        existingProject.userId.projects.pull(existingProject);
        // Remove tasks from project
        for (let task of existingProject.tasks) { 
            // Find the task in the user's tasks array
            await Task.findByIdAndRemove(task);
        }
        await existingProject.userId.save({ session: sess });
        await sess.commitTransaction();
    } catch(err) {
        const error = new Error(`Something went wrong, could not delete project`, 500);
        return next(error);
    }
    res.status(200).json({ message: 'Project deleted!' });
}

async function editProject(req, res) {
    const projectId = req.params.pid;

    let project;
    try {
        project = await Project.findById(projectId);
    } catch (err) {
        res.status(500).json({message: err.message});
    }

    if (!project) {
        res.status(404).json({message: `Project with id of ${projectId} not found`});
    }

    project.title = req.body.title;
    project.description = req.body.description;
    
    try {
        await project.save();
    } catch (err) {
        res.status(500).json({message: err.message});
    }
    res.status(200).json({ project: project });
}




module.exports = {
    getAllProjectsByUserId,
    getProjectById,
    createProject,
    deleteProject,
    editProject
}