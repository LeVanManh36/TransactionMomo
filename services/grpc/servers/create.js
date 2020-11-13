'use strict';

const {rootPath} = require('./config');
const srcPath = `${rootPath}/app/services/gRpc`;
const protoOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
};

module.exports = function (grpc, protoLoader, gRpcServer, subject) {
  let path = `${rootPath}/services/grpc/proto/digital/${subject}.proto`;
  let subjectProto = protoLoader.loadSync(path, protoOptions);
  let descriptor = grpc.loadPackageDefinition(subjectProto);
  let serviceName = `${subject}Service`;
  const Service = require(`${srcPath}/${subject.toLowerCase()}`);

  gRpcServer.addService(descriptor[serviceName].service, {
    list: Service.lists,
    fetch: Service.fetch
  })
}
