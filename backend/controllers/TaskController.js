const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/tasks.json");

// read tasks
function getTasksFromFile() {
  let rawData = fs.readFileSync(filePath, "utf-8");
  let parsed = JSON.parse(rawData);
  return parsed;
}

// save tasks
function writeTasksToFile(taskArr) {
  fs.writeFileSync(filePath, JSON.stringify(taskArr, null, 2));
}

// GET all tasks
function getAllTasks(req, res) {
  try {
    let allTasks = getTasksFromFile();

    let statusQ = req.query.status;
    let priorityQ = req.query.priority;

    if (statusQ && statusQ != "all") {
      allTasks = allTasks.filter(item => item.status == statusQ);
    }

    if (priorityQ && priorityQ != "all") {
      allTasks = allTasks.filter(item => item.priority == priorityQ);
    }

    res.json({
      success: true,
      tasks: allTasks
    });
  } catch (error) {
    console.log("error reading tasks", error);
    res.status(500).json({
      success: false,
      message: "Error reading tasks"
    });
  }
}

// ADD task
function addTask(req, res) {
  let { title, desc, priority } = req.body;

  if (!title || title.trim() == "") {
    return res.status(400).json({
      success: false,
      message: "Title needed"
    });
  }

  try {
    let taskList = getTasksFromFile();

    let newTaskObj = {
      id: Date.now(),
      title: title.trim(),
      desc: desc ? desc.trim() : "",
      status: "pending",
      priority: priority ? priority : "medium",
      createdAt: new Date().toISOString().split("T")[0]
    };

    taskList.push(newTaskObj);

    let updatedList = taskList;

    writeTasksToFile(updatedList);

    res.status(201).json({
      success: true,
      task: newTaskObj
    });
  } catch (error) {
    console.log("add task error", error);
    res.status(500).json({
      success: false,
      message: "Could not save task"
    });
  }
}

// UPDATE status
function updateTaskStatus(req, res) {
  let id = parseInt(req.params.id);
  let newStatus = req.body.status;

  let allowed = ["pending", "in-progress", "done"];

  if (!allowed.includes(newStatus)) {
    return res.status(400).json({
      success: false,
      message: "Wrong status"
    });
  }

  try {
    let taskArr = getTasksFromFile();

    let foundIndex = -1;

    for (let i = 0; i < taskArr.length; i++) {
      if (taskArr[i].id == id) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex == -1) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    taskArr[foundIndex].status = newStatus;

    writeTasksToFile(taskArr);

    res.json({
      success: true,
      task: taskArr[foundIndex]
    });
  } catch (error) {
    console.log("update error", error);
    res.status(500).json({
      success: false,
      message: "Update failed"
    });
  }
}

// DELETE task
function deleteTask(req, res) {
  let id = parseInt(req.params.id);

  try {
    let tasks = getTasksFromFile();

    let newArr = [];
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].id != id) {
        newArr.push(tasks[i]);
      }
    }

    if (newArr.length == tasks.length) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    writeTasksToFile(newArr);

    res.json({
      success: true,
      message: "Task deleted"
    });
  } catch (error) {
    console.log("delete error", error);
    res.status(500).json({
      success: false,
      message: "Delete failed"
    });
  }
}

module.exports = {
  getAllTasks,
  addTask,
  updateTaskStatus,
  deleteTask
};