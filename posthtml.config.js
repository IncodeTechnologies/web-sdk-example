module.exports = {
  plugins: {
    "posthtml-expressions": {
      locals: {
        SDK_URL: process.env.SDK_URL,
      },
    },
  },
};
