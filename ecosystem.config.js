module.exports = {
  apps: [
    {
      name: "web",
      script: "npm",
      args: "start",
      instances: "max", // Use all available cores
      exec_mode: "cluster", // Enable clustering
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
