const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/', taskController.getAllTasks);
router.post('/', taskController.addTask);
router.patch('/:id', taskController.updateTaskStatus);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
