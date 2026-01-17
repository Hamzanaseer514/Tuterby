require("dotenv").config();

const app = require("./api/index");
const { ConnectToDB } = require("./Configuration/db");

const PORT = process.env.PORT || 5000;

(async () => {
  await ConnectToDB();
  console.log("✅ DB connected (local)");

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})();
