import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  site_location: string;
  area_location: string;
  status: string;
  details: string;
  image_url: string;
  time_: Date;
  no_hardhat_count: number;
}

const EventSchema: Schema = new Schema(
  {
    site_location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location", 
      required: true,
    },
    area_location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "Not Handled",
      enum: ["Not Handled", "Handled"],
    },
    details: {
      type: String,
      required: true,
    },
    image_url: {
      type: String,
      required: true,
    },
    time_: {
      type: Date,
      required: true,
      default: Date.now,
    },
    no_hardhat_count: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { collection: "events", timestamps: true }
);

const EventModel = mongoose.model<IEvent>("Event", EventSchema);

export default EventModel;
