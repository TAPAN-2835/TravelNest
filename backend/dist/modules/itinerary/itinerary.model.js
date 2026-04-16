"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ItinerarySchema = new mongoose_1.Schema({
    tripId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    destination: { type: String },
    duration: { type: Number },
    generatedAt: { type: Date, default: Date.now },
    prompt: { type: String },
    days: [
        {
            day: { type: Number },
            date: { type: String },
            theme: { type: String },
            morning: {
                activity: { type: String },
                place: { type: String },
                duration: { type: String },
                cost: { type: Number },
                description: { type: String },
                mapLink: { type: String },
            },
            afternoon: {
                activity: { type: String },
                place: { type: String },
                duration: { type: String },
                cost: { type: Number },
                description: { type: String },
                mapLink: { type: String },
            },
            evening: {
                activity: { type: String },
                place: { type: String },
                duration: { type: String },
                cost: { type: Number },
                description: { type: String },
                mapLink: { type: String },
            },
            accommodation: {
                name: { type: String },
                type: { type: String },
                cost: { type: Number },
                location: { type: String },
            },
            dailyCost: { type: Number },
            tips: [{ type: String }],
        },
    ],
    totalEstimatedCost: { type: Number },
    currency: { type: String },
    flights: [{ type: mongoose_1.Schema.Types.Mixed }],
    hotels: [{ type: mongoose_1.Schema.Types.Mixed }],
    travelTips: [{ type: String }],
    packingList: [{ type: String }],
    emergencyContacts: [{ type: String }],
});
exports.default = mongoose_1.default.model('Itinerary', ItinerarySchema);
//# sourceMappingURL=itinerary.model.js.map