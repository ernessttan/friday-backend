const Project = require('../models/project');

async function getAllProjects(req, res) {
    let projects;
    try {
        projects = await Project.find();
    } catch (err) {
        res.status(500).json({message: err.message});
    }
    res.status(200).json({projects: projects.map((project) => project.toObject({ getters: true }))});
}

async function getProjectById(req, res) {
    const projectId = req.param.pid;

    let project;
    try {
        project = await Project.findById(projectId);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
    
    if(!project) {
        res.status(404).json({message: `Project with id of ${projectId} not found`});
    }

    res.status(200).json({ project: project });
}

async function createProject(req, res) {
    const project = new Project({
        title: req.body.title,
        description: req.body.description,
        tasks: [],
        userId: req.body.userId
    });

    try {
        await project.save();
    } catch (err) {
        res.status(500).json({message: err.message});
    }
    res.status(201).json({ project: project });
}

async function deleteProject(req, res) {
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

    try {
        await Task.deleteOne({ _id: taskId });
    } catch (err) {
        res.status(500).json({message: err.message});
    }
    res.status(200).json({message: `Project with id of ${projectId} deleted`});
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
    getAllProjects,
    getProjectById,
    createProject,
    deleteProject,
    editProject
}