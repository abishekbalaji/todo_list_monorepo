import { useEffect, useState } from "react";
import type { Task } from "@todo-app/shared";

const App = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  useEffect(() => {
    const getTasks = async () => {
      const tasksJSON = await fetch("http://localhost:3000/tasks");
      const data = await tasksJSON.json();
      setTasks(data.tasks);
    };
    getTasks();
  }, []);
  return (
    <div>
      {tasks.map((task: Task) => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>{`${task.completed}`}</p>
        </div>
      ))}
    </div>
  );
};

export default App;
