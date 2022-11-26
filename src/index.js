const express = require("express");
const cors = require("cors");

const { v4: uuid } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    response.status(404).json({ error: "Usuário não encontrado." });
  }

  request.user = user;

  return next();
}

//

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.find((user) => user.username === username);

  if (userAlreadyExists) {
    response.status(400).json({ error: "Esse usúario já existe." });
  }

  users.push({
    name,
    username,
    id: uuid(),
    todos: [],
  });

  response.status(201).json(users.find((user) => user.username === username));
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newToDo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newToDo);

  response.status(201).json(newToDo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const changeTodo = user.todos.find((todo) => todo.id === id);

  if (!changeTodo) {
    response.status(404).json({ error: "Tarefa não encontrada." });
  }

  changeTodo.title = title;
  changeTodo.deadline = deadline;

  return response.status(200).json(changeTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const changeToDone = user.todos.find((todo) => todo.id === id);

  if (!changeToDone) {
    response.status(404).json({ error: "Tarefa não encontrada." });
  }

  changeToDone.done = true;

  return response.status(200).json(changeToDone);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const deleteTodo = user.todos.find((todo) => todo.id === id);

  if (!deleteTodo) {
    response.status(404).json({ error: "Tarefa não encontrada." });
  }

  user.todos.splice(deleteTodo, 1);

  response.status(204).json({ message: "Tarefa excluída com sucesso!" });
});

module.exports = app;
