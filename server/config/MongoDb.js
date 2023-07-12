import mongoose from "mongoose";
import dotenv from "dotenv";


dotenv.config();
mongoose.set("strictQuery", false);

const connectDatabase = async () => {
  try {
    const conn= await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,

      
    });

    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDatabase;
