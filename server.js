const express = require('express');

const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const multer = require('multer');
const { Readable } = require('stream');



const app = express();
const trackRoute = express.Router();
app.use('/tracks', trackRoute);

const dbName = 'soundfromMAX';
let dbclient;
MongoClient.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then((client)=>{
  console.log('mongo connected!')
  dbclient = client.db(dbName);
})

trackRoute.get('/:_id', (req, res) => {
  try {
    var _id = new ObjectID(req.params._id);
  } catch(err) {
    return res.status(400).json({ message: "Invalid trackID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" }); 
  }
  //res.set('Content-Type', 'audio/mp3');
  // res.set('Content-Type', 'audio/x-aiff');
  res.set('Content-Type', 'audio/wav');
  res.set('Accept-Ranges', 'bytes');

  let bucket = new mongodb.GridFSBucket(dbclient, {
    bucketName: 'tracks'
  });
  
  let downloadStream = bucket.openDownloadStream(_id);

  downloadStream.on('data', (chunk) => {
    res.write(chunk);
  });

  downloadStream.on('error', () => {
    res.sendStatus(404);
  });

  downloadStream.on('end', () => {
    res.end();
  });
});

trackRoute.post("/api/upload", (req,res)=>{

  const storage = multer.memoryStorage();
  
  const upload = multer({ storage: storage, limits: { fields: 1, fileSize: 60000000, files: 1, parts: 2 }});
  upload.single('track')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: "Upload Request Validation Failed" });
    } else if(!req.body) {
      return res.status(400).json({ message: "No track in request body" });
    }
   //console.log(req.body);

   let trackName = req.body.name;
    console.log(trackName);
    // Covert buffer to Readable Stream
    const readableTrackStream = new Readable();
    readableTrackStream.push(req.file.buffer);
    readableTrackStream.push(null);

    let bucket = new mongodb.GridFSBucket(dbclient, {
      bucketName: 'tracks'
    });

    let uploadStream = bucket.openUploadStream(trackName);
    let id = uploadStream.id;
    
    console.log(uploadStream);
    readableTrackStream.pipe(uploadStream);

    uploadStream.on('error', () => {
      return res.status(500).json({ message: "Error uploading file" });
    });

    uploadStream.on('finish', () => {
      return res.status(201).json({ message: "File uploaded successfully, stored under Mongo ObjectID: " + id, id: id });
    });
  })
});

app.get("/", function(request, response) {
  response.sendFile(__dirname + '/app/index.html');
});

app.use(express.static('public'));

app.listen(3005, () => {
  console.log("App listening on port 3005!");
});