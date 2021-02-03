module.exports = {
  '*.ts': [
    () => 'tsc -p tsconfig.json --noEmit',
    (filenames) => `eslint ${filenames.join(' ')} --fix --max-warnings 0`,
    (filenames) =>
      filenames.map((filename) => `prettier --write '${filename}'`),
  ],
};
