import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  area_id: mongoose.Types.ObjectId;
  time_stamp: Date;
  image_url: string;
  description: string;
}

const EventSchema: Schema = new Schema(
  {
    area_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
      required: true,
    },
    time_stamp: { type: Date, default: Date.now },
    image_url: { type: String, required: true },
    description: { type: String },
  },
  { collection: "events", timestamps: true }
);

const EventModel = mongoose.model<IEvent>("Event", EventSchema);

export default EventModel;
