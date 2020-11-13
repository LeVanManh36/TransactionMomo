const rootPath = process.cwd();
const {
  GRPC_HOST, GRPC_PORT,
  GRPC_AUTH_HOST, GRPC_AUTH_PORT,
  GRPC_FILE_HOST, GRPC_FILE_PORT
} = process.env;

const Auth = {
  gRpcHost: GRPC_AUTH_HOST || "127.0.0.1",
  gRpcPort: GRPC_AUTH_PORT || "50050"
}
const Digital = {
  gRpcHost: GRPC_HOST || "127.0.0.1",
  gRpcPort: GRPC_PORT || "50051"
}
const File = {
  gRpcHost: GRPC_FILE_HOST || "127.0.0.1",
  gRpcPort: GRPC_FILE_PORT || "50052"
}

module.exports = {
  rootPath: rootPath,
  externalServices: {
    auth: {
      ...Auth,
      gRpcServerUri: `${Auth.gRpcHost}:${Auth.gRpcPort}`
    },
    file: {
      ...File,
      gRpcServerUri: `${File.gRpcHost}:${File.gRpcPort}`
    },
    digital: {
      ...Digital,
      gRpcServerUri: `${Digital.gRpcHost}:${Digital.gRpcPort}`
    }
  }
}
