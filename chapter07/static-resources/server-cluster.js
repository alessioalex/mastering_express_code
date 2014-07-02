var clusterMaster = require("cluster-master");

clusterMaster({
  exec: "server.js",
  env: { NODE_ENV: "production" },
  size: process.env.SIZE || null
});
