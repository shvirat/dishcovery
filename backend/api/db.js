const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      dbName: "dishcovery_dev",
      bufferCommands: false,
    }).then(mongoose => mongoose);
  }

  cached.conn = await cached.promise;
  console.log("MongoDB connected");
  return cached.conn;
}

module.exports = connectDB;
