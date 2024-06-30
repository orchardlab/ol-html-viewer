export default {
  files: ["test/**/*.test.js"],
  require: ["./test/setup.js"],
  environmentVariables: {
    NODE_ENV: "test",
  },
};
