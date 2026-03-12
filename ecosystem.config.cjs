const path = require("path");

const projectRoot = __dirname;
const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";
const windowsShell = "C:\\Windows\\System32\\cmd.exe";
const pythonInterpreter = isWindows
  ? path.join(projectRoot, ".venv", "Scripts", "python.exe")
  : path.join(projectRoot, ".venv", "bin", "python");

const adminDevCommand = isWindows
  ? '/c npm run dev -- --host 0.0.0.0 --port 5174 --strictPort'
  : "run dev -- --host 0.0.0.0 --port 5174 --strictPort";

const userDevCommand = isWindows
  ? '/c npm run dev -- --host 0.0.0.0 --port 5173 --strictPort'
  : "run dev -- --host 0.0.0.0 --port 5173 --strictPort";

module.exports = {
  apps: [
    {
      name: "milkman-backend",
      cwd: path.join(projectRoot, "milkman", "backend"),
      script: "manage.py",
      interpreter: pythonInterpreter,
      args: "runserver 0.0.0.0:8000 --noreload",
      env: {
        DJANGO_SETTINGS_MODULE: "config.settings",
        PYTHONUNBUFFERED: "1"
      },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000
    },
    {
      name: "milkman-admin-site",
      cwd: path.join(projectRoot, "milkman", "frontend", "admin_site"),
      script: isWindows ? windowsShell : npmCommand,
      args: adminDevCommand,
      interpreter: "none",
      env: {
        NODE_ENV: "development"
      },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000
    },
    {
      name: "milkman-user-site",
      cwd: path.join(projectRoot, "milkman", "frontend", "user_site"),
      script: isWindows ? windowsShell : npmCommand,
      args: userDevCommand,
      interpreter: "none",
      env: {
        NODE_ENV: "development"
      },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000
    }
  ]
};
