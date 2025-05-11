
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
},{ Collection: "users"});


const userModel = mongoose.model("User", userSchema);

export default userModel;