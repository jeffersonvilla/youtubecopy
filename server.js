require('dotenv').config();
const express = require('express');
//const cors = require('cors');
const mongodb = require('mongodb');
const fs = require("fs");
const mongoose = require('mongoose');
//const bodyParser = require('body-parser');
//const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
//const Grid = require('gridfs-stream');
//const methodOverride = require('method-override');

const app = express();


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });



//app.set('view engine', 'ejs');

//app.use(cors());

//app.use('/public', express.static(`${process.cwd()}/public`));

//app.use(bodyParser.urlencoded({extended: false}));

//app.use(bodyParser.json());

//app.use(methodOverride('_method'));

//init gfs
//let gfs;

/*conn.once('open', ()=>{
    //init Stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
})*/

//Create storage engine
const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    file: (req, file)=>{
        return new Promise((resolve, reject)=>{
            crypto.randomBytes(16, (err, buf)=>{
                if(err){
                    return reject(err);
                }
                const filename = "bigbuck2"//buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: "bigbuck3",
                    bucketName: 'fs'
                };
                resolve(fileInfo);
            });
        });
    }
});

const upload = multer({storage});

app.get('/',(req, res)=>{
    res.sendFile(process.cwd() + '/views/index.html');
})

/*app.get('/init-video', function (req, res) {
    mongodb.MongoClient.connect(process.env.MONGO_URI, function (error, client) {
      if (error) {
        res.json(error);
        return;
      }
      const db = client.db('myFirstDatabase');
      const bucket = new mongodb.GridFSBucket(db,{bucketName: "uploads"});
      const videoUploadStream = bucket.openUploadStream('video');
      const videoReadStream = fs.createReadStream('./ytcvideo6.mp4');
      videoReadStream.pipe(videoUploadStream);
      res.status(200).send("Done...");
    });
  });
*/

app.post('/upload', upload.single('file'), (req, res)=>{
    res.redirect('/');
});


/*app.get('/videos', (req, res)=>{
    gfs.files.find().toArray((err, files)=>{
        if(!files || files.length === 0){
            return res.status(404).json({err: "No existen videos"});
        }
        return res.json(files);
    });
});*/

app.get('/video', function(req, res){

      var range = req.headers.range;
      if (!range) {
        range = "1000";
      }

      const db = mongoose.connection.db;
  
      // GridFS Collection
      db.collection('uploads.files').findOne({filename: "bigbuck3"}, (err, video) => {
        if (!video) {
          res.status(404).send("No video uploaded!");
          return;
        }
  
        // Create response headers
        const videoSize = video.length;
        const start = Number(range.replace(/\D/g, ""));
        const end = videoSize - 1;
  
        const contentLength = end - start + 1;
        const headers = {
          "Content-Range": `bytes ${start}-${end}/${videoSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": contentLength,
          "Content-Type": "video/mp4",
        };
  
        // HTTP Status 206 for Partial Content
        res.writeHead(206, headers);
  
        //625a158d8fd4b73d88da6e0a (bigbuck2)
        //625a2991edc6213e88b86155 (bigbuck3)

        //aunque ponga uploads arriba openDownloadStream sigue buscado por default en fs
        const bucket = new mongodb.GridFSBucket(db);
        const downloadStream = bucket.openDownloadStream(mongoose.Types.ObjectId('625a2991edc6213e88b86155'), {
          start
        });
        
        // Finally pipe video to response
        downloadStream.pipe(res);
      });
  })

  /*
app.get('/video/:id', (req, res)=>{
    gfs.files.findOne({_id: req.params.id},(err, file)=>{
        if(!file || file.length ===0){
            return res.status(404).json({
                err:"No existe el video"
            });
        }
        //El video existe
        if(file.contentType === 'video/mp4'){
            const readstream = gfs.createReadStream(file['_id']);
            readstream.pipe(res);
        }else{
            res.status(404).json({err: "No es un video"});
        }
    })
});
*/
const port = process.env.PORT || 3000;

app.listen(port, function() {
    console.log(`Listening on port ${port}`);
  });
  