const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const mongoConnect = require("./mongoConnect")
const dotenv = require("dotenv");
dotenv.config();

const Document = require("./Document")
const ENDPOINT = ["https://google-docs-gamma.vercel.app" , "http://localhost:3000",'https://google-docs-bunty9.vercel.app','https://google-docs-git-master-bunty9.vercel.app' ]

const app = express();
app.use(cors())
app.use(function (req, res, next) {

  var allowedDomains = ['https://google-docs-gamma.vercel.app','http://localhost:3000','https://google-docs-bunty9.vercel.app','https://google-docs-git-master-bunty9.vercel.app' ];
  var origin = req.headers.origin;
  if(allowedDomains.indexOf(origin) > -1){
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept');
  res.setHeader('Access-Control-Allow-Credentials', true);

  next();
})

app.get('/', function (req, res, next) {
  res.json({msg: 'API Working'})
})

const server = http.createServer(app);

// server-side
const io =  socketio(server, {
  path: "/",
  cors: {
    origin: ENDPOINT,
    methods: ["GET", "POST"],
    allowedHeaders: ["Access-Control-Allow-Origin"],
    credentials: true
  }
})

mongoConnect();



const defaultValue = ""

io.on("connection", socket => {
  socket.on("get-document", async documentId => {
    const document = await findOrCreateDocument(documentId)
    socket.join(documentId)

    socket.emit("load-document", document.data)

    socket.on("send-changes", delta => {
      socket.broadcast.to(documentId).emit("receive-changes", delta)
    })

    socket.on("save-document", async data => {
      await Document.findByIdAndUpdate(documentId, { data })
    })
  })
})



async function findOrCreateDocument(id) {
  if (id == null) return

  const document = await Document.findById(id)
  if (document) return document
  return await Document.create({ _id: id, data: defaultValue })
}



server.listen(process.env.PORT || 5000, () => console.log(`Server has started.`));