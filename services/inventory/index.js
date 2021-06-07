const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const products = require('./products.json');

const packageDefinition = protoLoader.loadSync('proto/inventory.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const inventoryProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

// implementa os métodos do InventoryService
server.addService(inventoryProto.InventoryService.service, {
    searchAllProducts: (_, callback) => {
        callback(null, {
            products: products,
        });
    },
	SearchProductByID: (payload, callback) => {
        callback(
            null,
            products.find((product) => product.id == payload.request.id)
        );
    },
    SearchProductByIdAndDecreaseQuantity : (payload, callback) => {
        products.forEach(p => {
            if (p.id == payload.request.id) {
                if (p.quantity > 0) {
                    p.quantity -= 1
                }
            }
        });
        callback(
            null,
            products.find((product) => product.id == payload.request.id)
        );
    },
    SearchProductByIdAndAddQuantity: (payload, callback) => {
        products.forEach(p => {
            if (p.id == payload.request.id) {
                if (payload.request.quantity > 0) {
                    p.quantity = payload.request.quantity
                }
            }
        });
        callback(
            null,
            {id: payload.request.id, quantity: payload.request.quantity}
        );
    },
});

server.bindAsync('127.0.0.1:3002', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Inventory Service running at http://127.0.0.1:3002');
    server.start();
});
