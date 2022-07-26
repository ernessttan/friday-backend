const express = require('express');
const ProjectControllers = require('../controllers/projects');

const router = express.Router();

// Route to get all Projects
router.get('/', ProjectControllers.getAllProjects);

// Route to get a Project by id
router.get('/:pid', ProjectControllers.getProjectById);

// Route to create a Project
router.post('/', ProjectControllers.createProject);

// Route to delete a Project
router.delete('/:pid', ProjectControllers.deleteProject);

// Route to update a Project
router.patch('/:pid', ProjectControllers.editProject);

module.exports = router;