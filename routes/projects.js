const express = require('express');
const ProjectControllers = require('../controllers/projects');

const router = express.Router();

// Route to get all Projects for a user
router.get('/user/:uid', ProjectControllers.getAllProjectsByUserId);

// Route to get a Project by id
router.get('/:pid', ProjectControllers.getProjectById);

router.use(require('../middleware/checkAuth'));

// Route to create a Project
router.post('/', ProjectControllers.createProject);

// Route to delete a Project
router.delete('/:pid', ProjectControllers.deleteProject);

// Route to update a Project
router.patch('/:pid', ProjectControllers.editProject);

module.exports = router;