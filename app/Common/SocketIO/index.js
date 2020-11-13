'use strict';

const oldSocketIo = require('./old');
const newSocketIo = require('./new');
const {roomSnapshot} = require('../../../config');
const FileUtil = require('../../../utils/files');

module.exports = {

  detectVersion(player) {
    return player.newSocketIo ? newSocketIo : oldSocketIo
  },

  /*
    * param 1: player
    * param 2: event
    * param 3: data1
    * param 4: data2
   */
  emitEvent(player, event) {
    let sk = this.detectVersion(player);
    let args = Array.prototype.slice.call(arguments, 1);
    sk.emitMessage(player.socket, ...args);
  },

  emitAll(event, data = null, room = null) {
    oldSocketIo.emitAll(event, data, room);
  },

  joinRoom(sid, room) {
    oldSocketIo.joinRoom(sid, room)
  },

  leaveRoom(sid, room = null) {
    if (room) {
      oldSocketIo.leaveRoom(sid, room)
    } else {
      let rooms = oldSocketIo.getRoom(sid);
      for (let key in rooms) {
        if (key.length && key.includes(roomSnapshot)) {
          key = key.slice(1);
          oldSocketIo.leaveRoom(sid, key)
        }
      }
    }
  },

  getRoom(sid) {
    return oldSocketIo.getRoom(sid)
  }
};
