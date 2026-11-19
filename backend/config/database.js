const mongoose = require("mongoose");

const connectDatabase = async () => {
  const mongoUri = process.env.DB_URI || process.env.DB_LOCAL_URI;

  if (!mongoUri) {
    throw new Error(
      "MongoDB URI is not defined. Set DB_URI or DB_LOCAL_URI in Render environment variables."
    );
  }

  const connection = await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 15000,
  });

  console.log(
    `MongoDB Database connected with HOST: ${connection.connection.host}`
  );

  return connection;
};

module.exports = connectDatabase;
