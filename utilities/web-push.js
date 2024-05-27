const webpush = require('web-push');

// Replace these with your newly generated VAPID keys
const vapidKeys = {
  publicKey: 'BCkfFHc2vl7Aq9EMEGEyklQrzqEPxouLvD__3iIwr7-nw0I2RddQKylE_5h5BWFrq2P_r7sHAk0ngUHgEKI0IFk',
  privateKey: 'wBMAs3M_b9IcV62Zk0qXqabJAVbH1VLK6iE-Ibpyb4E'
};

webpush.setVapidDetails(
  'mailto:manev.blazhe@student.um.si',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

module.exports = webpush;
