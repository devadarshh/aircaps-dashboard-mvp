module.exports = {
  apps: [
    {
      name: "web",
      script: "npm",
      args: "start",
      instances: 1, // Cluster mode with 'npm' causes port conflicts. Using fork mode.
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "worker",
      script: "dist-worker/lib/worker.js",
      instances: 1, // Single instance for worker to avoid duplicate job processing
      exec_mode: "fork",
      node_args: "-r tsconfig-paths/register", // Register path aliases
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
