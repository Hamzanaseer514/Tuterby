// ...existing code...
const mongoose = require("mongoose");
require("dotenv").config();
const logPlugin = require("../plugin/LogPlugin");

mongoose.set("strictQuery", false);

// Register plugin immediately so it attaches to schemas created later OR previously required schemas
// (If models were required before this module is required, ensure this file is imported early in server startup.)
try {
  mongoose.plugin(logPlugin);
} catch (e) {
  console.warn("Warning: failed to register log plugin at module load time", e.message);
}

const ConnectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });

       // plugin already registered above at module load

        console.log("Connected to Database");
    } catch (error) {
        console.error("Error Connecting to DB", error.message);
        process.exit(1);
    }
}

module.exports = { ConnectToDB };
// ...existing code...