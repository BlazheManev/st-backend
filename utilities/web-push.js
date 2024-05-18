const webpush = require('web-push');

// VAPID keys should be generated and kept secure
const vapidKeys = {
  publicKey: 'BOmZXhFpI-ghh6CfxnT6SHraz5fQCULI69ZVTHNkl5D7tTl910gUl_ftDvu9b6fj0KDfap-rqe0VnOOqzq_HQ7M',
  privateKey: 'kXm2OjsmjrR6CShXA7mBh-dWpGfQfiaPdsXO0b7DIFI'
};

webpush.setVapidDetails(
  'mailto:manev.blazhe@student.um.si',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);
