module.exports = {
  default: {
    require: ['step_definitions/**/*.ts'],
    requireModule: ['ts-node/register'],
    paths: ['features/**/*.feature'],
    format: ['progress-bar'],
  },
};
