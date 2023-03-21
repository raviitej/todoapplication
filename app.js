const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const initializeServerAndDbConnection = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3003, () => {});
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};
initializeServerAndDbConnection();

//API 1
const bothPriorityAndStatus = (objects) => {
  return objects.priority !== undefined && objects.status !== undefined;
};
const hasPriority = (objects) => {
  return objects.priority !== undefined;
};

const hasStatus = (objects) => {
  return objects.status !== undefined;
};

const hasTodo = (objects) => {
  return objects.todo !== undefined;
};

app.get("/todos/", async (request, response) => {
  let dbQuery = "";
  let data = null;

  const { search_q = "", priority, status } = request.query;
  switch (true) {
    case bothPriorityAndStatus(request.query):
      dbQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status = '${status}' AND priority = '${priority}';`;
      break;
    case hasPriority(request.query):
      dbQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority = '${priority}';`;
      break;
    case hasStatus(request.query):
      dbQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status = '${status}';`;
      break;

    default:
      dbQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
  }

  data = await db.all(dbQuery);
  response.send(data);
});

//API2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const playerQuery = `SELECT
        *
        FROM
        todo
        WHERE
        id = ${todoId};`;
  const playerHistory = await db.get(playerQuery);
  response.send(playerHistory);
});

//API3

app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const postQuery = `INSERT INTO  todo (id,todo,priority,status) VALUES (${id},'${todo}','${priority}','${status}');`;
  const postResponse = await db.run(postQuery);
  response.send("Todo Successfully Added");
});

//API4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const dbsQuery = `SELECT * FROM todo WHERE id = ${todoId}`;
  const previousTodo = await db.get(dbsQuery);
  const {
    todo = previousTodo.todo,
    status = previousTodo.status,
    priority = previousTodo.priority,
  } = request.body;
  switch (true) {
    case bothPriorityAndStatus(request.body):
      dbQuery = `UPDATE todo SET priority = '${priority}',status = '${status}' WHERE id = ${todoId};`;
      await db.run(dbQuery);
      response.send("Priority and Status Updated");
      break;
    case hasPriority(request.body):
      dbQuery = `UPDATE todo SET priority = '${priority}' WHERE id = ${todoId};`;
      await db.run(dbQuery);
      response.send("Priority Updated");
      break;
    case hasStatus(request.query):
      dbQuery = `UPDATE todo SET status = '${status}' WHERE id = ${todoId};`;
      await db.run(dbQuery);
      response.send("Status Updated");
      break;

    case hasTodo(request.body):
      dbQuery = `UPDATE todo SET todo = '${todo}' WHERE id = ${todoId};`;
      await db.run(dbQuery);
      response.send("Todo Updated");
      break;

    default:
      dbQuery = `UPDATE todo SET todo='%${search_q}%',priority = '${priority}',status = '${status}' WHERE id = ${todoId};`;
      await db.run(dbQuery);
      response.send("All are Updated");
  }
});

//API 5

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `DELETE FROM todo WHERE id = ${todoId};`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
