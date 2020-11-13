'use strict';

// const _ = require('lodash');
// const moment = require('moment');
// const to = require('await-to-js').default;

module.exports = {
  handle(socket, isNewVersion) {
    socket.on('status', async (settings, status) => {
      console.log('event status:', settings, status)
    });

    socket.on('disconnect', async (reason) => {
      console.log('disconnectEvent reason:', reason)
    });

    socket.on('reconnect', async (player) => {
      console.log('reconnect device:', player)
    });

    socket.on('getConfigServer', () => {
      socket.emit('configServer', {})
    });

    socket.on('error', (err) => {
      console.log("socket on error: ", err);
    });
  }
}
