let config = {
  accessTokenSecret: 'default-access-secret',
  refreshTokenSecret: 'default-refresh-secret',
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
};

function initAuthConfig(userConfig = {}) {
  config = { ...config, ...userConfig };
}

function getAuthConfig() {
  return config;
}

module.exports = { initAuthConfig, getAuthConfig };
