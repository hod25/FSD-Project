import mongoose, { Schema, Document } from "mongoose";

export interface IArea extends Document {
  name: string;
  url: string;
}

const AreaSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
  },
  { collection: "areas", timestamps: true }
);

const AreaModel = mongoose.model<IArea>("Area", AreaSchema);

export default AreaModel;
