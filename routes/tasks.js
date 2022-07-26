const express = require('express');
const taskControllers = require('../controllers/tasks');

const router = express.Router();

// Route to get all tasks for a user
router.get('/user/:uid', taskControllers.getAllTasksByUserId);

// Route to get all tasks for a project
router.get('/project/:pid', taskControllers.getAllTasksByProjectId);

// Route to get a task by id
router.get('/:tid', taskControllers.getTaskById);

router.use(require('../middleware/checkAuth'));

// Route to create a task
router.post('/', taskControllers.createTask);

// Route to delete a task
router.delete('/:tid', taskControllers.deleteTask);

// Route to update a task
router.patch('/:tid', taskControllers.editTask);

module.exports = router;