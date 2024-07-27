import mongoose from "mongoose";

mongoose.connect(
  "mongodb+srv://almousayazan21:7G3vSbVlNWzLv9O4@cluster0.bw29zku.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
);

const userSchema = new mongoose.Schema({
  id: Number,
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    // corrected to match naming conventions
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
