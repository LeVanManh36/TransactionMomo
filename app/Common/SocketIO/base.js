'use strict';

const SkClient = require('./process');

class Base {
  constructor() {
    this.ioSockets = null;
    this.isNewVersion = false;
    this.client = SkClient;
  }

  startSIO(io) {
    io.sockets.on('connection', (client) => this.client.handle(client, this.isNewVersion));
    if (!this.isNewVersion) {
      io.set('log level', 0);
    }
    this.ioSockets = io.sockets;
  }

  emitMessage(sid) {
    if (this.ioSockets.sockets[sid]) {
      let args = Array.prototype.slice.call(arguments, 1);
      try {
        this.ioSockets.sockets[sid].emit.apply(this.ioSockets.sockets[sid], args);
      } catch (e) {
        console.log('socket.emitMessage error ', e);
      }
    }
  }

  joinRoom(sid, room) {
    if (this.ioSockets.sockets[sid]) {
      this.ioSockets.sockets[sid].join(room, () => {
        // console.log(`User '${sid}' has joined room '${room}'`);
      });
    }
  }

  leaveRoom(sid, room) {
    if (this.ioSockets.sockets[sid]) {
      this.ioSockets.sockets[sid].leave(room, () => {
        // console.log(`User '${sid}' has left room '${room}'`);
      });
    }
  }

  getRoom(sid) {
    return this.ioSockets.manager.roomClients[sid]
  }

  getClientRoom(room) {
    return this.ioSockets.clients[room]
  }

  emitAll(event, data, room = null) {
    if (room) {
      this.ioSockets.to(room).emit(event, data)
    } else {
      this.ioSockets.emit(event, data)
    }
  }
}

module.exports = Base;
