"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongoDB = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const mongoose_1 = __importDefault(require("mongoose"));
exports.prisma = new client_1.PrismaClient();
const connectMongoDB = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    }
    catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
};
exports.connectMongoDB = connectMongoDB;
//# sourceMappingURL=database.js.map