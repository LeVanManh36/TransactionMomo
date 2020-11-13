'use strict';

const {rootPath, externalServices} = require('./config');
const protoOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
};

module.exports = function (grpc, protoLoader, subject, service = "auth") {
  let path = `${rootPath}/services/grpc/proto/${service}/${subject}.proto`;
  let subjectProto = protoLoader.loadSync(path, protoOptions);
  let descriptor = grpc.loadPackageDefinition(subjectProto);
  let serviceName = `${subject}Service`;
  let Service = descriptor[serviceName];
  let {gRpcServerUri} = externalServices[service];
  // console.log(`${serviceName} gRpc Client listening on ${gRpcServerUri}`)
  return new Service(gRpcServerUri, grpc.credentials.createInsecure());
}
