"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = exports.io = void 0;
const socket_io_1 = require("socket.io");
const jwt_utils_1 = require("../shared/utils/jwt.utils");
const setupSocket = (server) => {
    exports.io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            methods: ['GET', 'POST'],
        },
    });
    exports.io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token)
            return next(new Error('Authentication error'));
        try {
            const decoded = (0, jwt_utils_1.verifyAccessToken)(token);
            socket.user = decoded;
            next();
        }
        catch (err) {
            next(new Error('Authentication error'));
        }
    });
    exports.io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        socket.on('subscribe:trip', (tripId) => {
            socket.join(`trip:${tripId}`);
        });
        socket.on('subscribe:alerts', (userId) => {
            socket.join(`user:${userId}`);
        });
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
    return exports.io;
};
exports.setupSocket = setupSocket;
//# sourceMappingURL=socket.js.map