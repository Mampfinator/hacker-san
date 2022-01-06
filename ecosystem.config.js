module.exports = {
  apps : [{
    name: "hacker-san-v2",
    interpreter: "/usr/local/bin/ts-node",
    script: 'src/index.ts',
    watch: '.'
  }]
};
