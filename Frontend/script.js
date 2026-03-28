const apiUrl = "http://localhost:3000/api/tasks";

window.onload = () => {
  showTasks();
};

async function showTasks(taskStatus = "all", taskPriority = "all") {
  let listBox = document.getElementById("taskList");
  listBox.innerHTML = `<p class="loading-txt">Loading...</p>`;

  let reqUrl = `${apiUrl}?status=${taskStatus}&priority=${taskPriority}`;

  try {
    let response = await fetch(reqUrl);
    let result = await response.json();

    if (result.success != true) {
      listBox.innerHTML = `<p class="no-tasks">Unable to load tasks.</p>`;
      return;
    }

    if (result.tasks.length == 0) {
      listBox.innerHTML = `<p class="no-tasks">No tasks available.</p>`;
      return;
    }

    listBox.innerHTML = "";

    for (let i = 0; i < result.tasks.length; i++) {
      let oneTask = makeTaskCard(result.tasks[i]);
      listBox.appendChild(oneTask);
    }
  } catch (error) {
    console.log("error in loading tasks", error);
    listBox.innerHTML = `<p class="no-tasks">Server not connected.</p>`;
  }
}

function makeTaskCard(taskObj) {
  let mainDiv = document.createElement("div");

  if (taskObj.status == "done") {
    mainDiv.className = "task-card done-card";
  } else {
    mainDiv.className = "task-card";
  }

  mainDiv.id = "task-" + taskObj.id;

  let descriptionText = "";
  if (taskObj.desc) {
    descriptionText = `<p>${taskObj.desc}</p>`;
  }

  mainDiv.innerHTML = `
    <div class="task-info">
      <h3>${taskObj.title}</h3>
      ${descriptionText}
      <div class="task-meta">
        <span class="badge ${taskObj.status}">${taskObj.status}</span>
        <span class="badge ${taskObj.priority}">${taskObj.priority}</span>
      </div>
      <div class="task-date">Added: ${taskObj.createdAt}</div>
    </div>

    <div class="task-actions">
      <select onchange="updateTaskStatus(${taskObj.id}, this.value)">
        <option value="pending" ${taskObj.status == "pending" ? "selected" : ""}>Pending</option>
        <option value="in-progress" ${taskObj.status == "in-progress" ? "selected" : ""}>In Progress</option>
        <option value="done" ${taskObj.status == "done" ? "selected" : ""}>Done</option>
      </select>

      <button class="btn-delete" onclick="removeTask(${taskObj.id})">Delete</button>
    </div>
  `;

  return mainDiv;
}

let formBox = document.getElementById("taskForm");

formBox.addEventListener("submit", async function (e) {
  e.preventDefault();

  let titleInput = document.getElementById("taskTitle").value;
  let descInput = document.getElementById("taskDesc").value;
  let priorityInput = document.getElementById("taskPriority").value;
  let msgBox = document.getElementById("formMsg");

  msgBox.className = "form-msg";
  msgBox.textContent = "";

  if (titleInput.trim() == "") {
    msgBox.textContent = "Task title is required.";
    msgBox.className = "form-msg error";
    return;
  }

  let sendData = {
    title: titleInput,
    desc: descInput,
    priority: priorityInput
  };

  try {
    let response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(sendData)
    });

    let result = await response.json();

    if (result.success == false) {
      msgBox.textContent = result.message || "Could not add task.";
      msgBox.className = "form-msg error";
      return;
    }

    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDesc").value = "";
    document.getElementById("taskPriority").value = "medium";

    msgBox.textContent = "Task added successfully";
    showTasks();
  } catch (error) {
    console.log("add task error", error);
    msgBox.textContent = "Backend error. Check server once.";
    msgBox.className = "form-msg error";
  }
});

async function updateTaskStatus(taskId, updatedStatus) {
  try {
    let response = await fetch(`${apiUrl}/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: updatedStatus })
    });

    let result = await response.json();

    if (result.success == false) {
      alert("Status not updated");
      return;
    }

    let statusValue = document.getElementById("statusFilter").value;
    let priorityValue = document.getElementById("priorityFilter").value;

    showTasks(statusValue, priorityValue);
  } catch (error) {
    console.log("status update error", error);
    alert("Problem updating task status");
  }
}

async function removeTask(taskId) {
  let ask = confirm("Are you sure you want to delete this task?");
  if (!ask) {
    return;
  }

  try {
    let response = await fetch(`${apiUrl}/${taskId}`, {
      method: "DELETE"
    });

    let result = await response.json();

    if (result.success == true) {
      let selectedCard = document.getElementById("task-" + taskId);
      if (selectedCard) {
        selectedCard.remove();
      }
    } else {
      alert("Task could not be deleted");
    }
  } catch (error) {
    console.log("delete error", error);
    alert("Some error happened");
  }
}

document.getElementById("applyFilter").addEventListener("click", function () {
  let selectedStatus = document.getElementById("statusFilter").value;
  let selectedPriority = document.getElementById("priorityFilter").value;

  showTasks(selectedStatus, selectedPriority);
});