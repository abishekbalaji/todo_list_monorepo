import "dotenv/config";
import express from "express";
import { Pool } from "pg";
import type { Task } from "@todo-app/shared";

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
});

type DBTask = {
  id: number;
  title: string;
  completed: boolean;
  created_at: Date;
  notes: string;
};

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.get("/tasks", async (_req, res) => {
  try {
    const result = (
      await pool.query<DBTask>(
        "select id, title, completed, created_at, notes from tasks",
      )
    ).rows;
    const tasks: Task[] = result.map(
      (task: DBTask): Task => ({
        id: task.id,
        title: task.title,
        completed: task.completed,
        createdAt: task.created_at.toISOString(),
        notes: task.notes,
      }),
    );

    res.status(200).json({
      tasks,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({
      error: "Internal Server error",
    });
  }
});

app.listen(port, () => {
  console.log(`To Do App is listening on port ${port}`);
});
