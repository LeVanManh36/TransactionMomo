'use strict';

const gRpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const gRpcServer = new gRpc.Server();
require('./create')(gRpc, protoLoader, gRpcServer, 'Area');
require('./create')(gRpc, protoLoader, gRpcServer, 'Player');
require('./create')(gRpc, protoLoader, gRpcServer, 'OOH');
require('./create')(gRpc, protoLoader, gRpcServer, 'Campaign');

const {gRpcServerUri} = require('./config');
gRpcServer.bind(gRpcServerUri, gRpc.ServerCredentials.createInsecure());
console.log(`gRPC server running on ${gRpcServerUri}`);

module.exports = gRpcServer
