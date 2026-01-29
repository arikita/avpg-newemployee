module.exports = {
    apps: [
      {
	name: "frontend",
	script: "npm",
	args: "run dev -- --host",
	cwd: "/home/dksvr/Documents/welcome-employee/frontend-new",
	interpreter: "none",
	env: {
	  NODE_ENV: "production"
	}
      },
      {
	name: "backend",
	script: "server.js",
	cwd: "/home/dksvr/Documents/welcome-employee/backend",
	env: {
	  NODE_ENV: "production",
	  PORT: 3000
	}
      }
    ]
};
