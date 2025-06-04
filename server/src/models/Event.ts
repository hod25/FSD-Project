// models/Event.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  site_location: string;
  area_location: string;
  status: string;
  details: string;
  image_url: string;
  time_: Date;
  no_hardhat_count?: number; 
}

const EventSchema: Schema = new Schema({
  site_location: { type: String, required: true },
  area_location: { type: String, required: true },
  status: { type: String, default: "Open" },
  details: { type: String, required: true },
  image_url: { type: String },
  time_: { type: Date, default: Date.now },
  no_hardhat_count: { type: Number, required: true }
});

export default mongoose.model<IEvent>("Event", EventSchema);
