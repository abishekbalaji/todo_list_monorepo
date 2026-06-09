import express from "express";
import type { Task } from "@todo-app/shared";

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.get("/tasks", (_req, res) => {
  const tasks: Task[] = [
    {
      id: "1",
      title: "task1",
      completed: true,
      createdAt: "20/1/2026",
      notes: "",
    },
    {
      id: "2",
      title: "task2",
      completed: true,
      createdAt: "20/1/2026",
      notes: "",
    },
  ];
  res.status(200).json({
    tasks,
  });
});

app.listen(port, () => {
  console.log(`To Do App is listening on port ${port}`);
});
