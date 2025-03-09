let task = null;

// Handling task creation
document.getElementById("createTaskBtn").addEventListener("click", () => {
    let description = document.getElementById("taskInput").value;

    try {
        if (!description.trim()) {
            throw new Error("Task description must not be empty.");
        }
        if (task !== null) {
            throw new Error("Task already exists.");
        }

        task = {
            description: description,
            completed: false
        };

        document.getElementById("output").innerText = "Task created successfully!";
    } catch (error) {
        document.getElementById("output").innerText = error.message;
    }
});

// Handling marking a task as completed
document.getElementById("markCompletedBtn").addEventListener("click", () => {
    if (task === null) {
        document.getElementById("output").innerText = "Eroro: No task has been created";
    } else {
        if (task.completed) {
            document.getElementById("output").innerText = "Task is already completed!";
        } else {
            task.completed = true;
            document.getElementById("output").innerText = "Task marked as completed!";
        }
    }
})

// Handling viewing a task
document.getElementById("viewTaskBtn").addEventListener("click", () => {
    if (task === null) {
        document.getElementById("output").innerText = "Error: No task has been created yet!";
    } else {
        let filter = document.getElementById("filterSelect").value;

        switch (filter) {
            case "all":
                document.getElementById("output").innerText = `Task: ${task.description} | Completed: ${task.completed}`;
                break;
            case "status":
                document.getElementById("output").innerText = `Completed: ${task.completed}`;
                break;
            default:
                document.getElementById("output").innerText = "Error: Invalid filter selected!";
        }
    }
});