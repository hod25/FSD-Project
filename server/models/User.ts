import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    notification: { type: Boolean, default: true },
    access_level: {
      type: String,
      enum: ["admin", "viewer", "supervisor"],
      default: "viewer",
    },
    site_location: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
  },
  { collection: "users", timestamps: true }
);

const userModel = mongoose.model("User", userSchema);
export default userModel;
