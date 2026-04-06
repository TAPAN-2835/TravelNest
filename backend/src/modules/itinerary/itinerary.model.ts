import mongoose, { Schema, Document } from 'mongoose';

export interface IItineraryDay {
  day: number;
  date: string;
  theme: string;
  morning: {
    activity: string;
    place: string;
    duration: string;
    cost: number;
    description: string;
    mapLink: string;
  };
  afternoon: {
    activity: string;
    place: string;
    duration: string;
    cost: number;
    description: string;
    mapLink: string;
  };
  evening: {
    activity: string;
    place: string;
    duration: string;
    cost: number;
    description: string;
    mapLink: string;
  };
  accommodation: {
    name: string;
    type: string;
    cost: number;
    location: string;
  };
  dailyCost: number;
  tips: string[];
}

export interface IItinerary extends Document {
  tripId: string;
  userId: string;
  destination: string;
  duration: number;
  generatedAt: Date;
  prompt: string;
  days: IItineraryDay[];
  totalEstimatedCost: number;
  currency: string;
  travelTips: string[];
  packingList: string[];
  emergencyContacts: string[];
}

const ItinerarySchema: Schema = new Schema({
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
  travelTips: [{ type: String }],
  packingList: [{ type: String }],
  emergencyContacts: [{ type: String }],
});

export default mongoose.model<IItinerary>('Itinerary', ItinerarySchema);
