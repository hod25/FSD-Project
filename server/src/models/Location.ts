import mongoose, { Schema, Document } from "mongoose";

export interface ILocation extends Document {
  name: string;
  areas: mongoose.Types.ObjectId[]; // קישור לאזורי משנה
}

const LocationSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    areas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Area" }],
  },
  { collection: "locations", timestamps: true }
);

const LocationModel = mongoose.model<ILocation>("Location", LocationSchema);

export default LocationModel;
