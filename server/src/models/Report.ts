import mongoose, { Schema, Document } from "mongoose";

export interface IReport extends Document {
  location_id: mongoose.Types.ObjectId;
  start_date: Date;
  end_date: Date;
  avg_per_day: number;
  events: mongoose.Types.ObjectId[];
}

const ReportSchema: Schema = new Schema(
  {
    location_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    avg_per_day: { type: Number, required: true },
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  },
  { collection: "reports", timestamps: true }
);

const ReportModel = mongoose.model<IReport>("Report", ReportSchema);

export default ReportModel;
