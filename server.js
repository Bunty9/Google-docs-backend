const mongoose = require("mongoose")
const Document = require("./Document")


const io = require("socket.io")(3001, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  })