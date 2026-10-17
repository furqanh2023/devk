// CRA 5 + Firebase SDKs can reference source maps that are not shipped in npm packages.
// Suppress only that known upstream warning; real compile errors remain visible.
module.exports = {
  webpack: {
    configure: (config) => {
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        (warning) => typeof warning?.message === 'string' && warning.message.includes('Failed to parse source map') && warning.message.includes('node_modules'),
      ];
      return config;
    },
  },
};
