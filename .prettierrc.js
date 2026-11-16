'use strict';

module.exports = {
  overrides: [
    {
      files: '*.{js,mjs,cjs,gjs}',
      options: {
        singleQuote: true,
      },
    },
    {
      files: '*.{hbs,gjs}',
      options: {
        singleQuote: false,
      },
    },
  ],
};
