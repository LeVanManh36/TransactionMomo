'use strict';

const gRpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const createGRPCClient = require('./create');
// load auth-service client
const authClient = createGRPCClient(gRpc, protoLoader, 'Auth', 'auth');
const userClient = createGRPCClient(gRpc, protoLoader, 'User', 'auth');
// load file-service client
const fileClient = createGRPCClient(gRpc, protoLoader, 'File', 'file');

module.exports = {
  // auth-service
  authClient,
  userClient,
  // file-service
  fileClient
}
