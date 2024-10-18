const app = require("./src/v1/app");
const {
   app: {port, host},
} = require("./src/v1/configs/configMongoDB");
require("dotenv").config();

const __port = port || 5550;
const __host = host || "127.0.0.1";

app.listen(port, host, async () => {
   console.log(`App listening on http://localhost:${port}`);
});
