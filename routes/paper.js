const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const router = new express.Router()
const auth = require('../middleware/auth')
const Vechile = require('../models/vechile');
const Paper = require('../models/paper');

// Mongo URI
const mongoURI = process.env.MONGODB_URL;

// Create mongo connection
const conn = mongoose.createConnection(mongoURI,{useNewUrlParser : true,useUnifiedTopology : true ,useCreateIndex : true});

// Init gfs
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('paper');
});

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG|pdf)$/)){
        return req.error = 'Please upload the from the uploading extension : jpg,jpeg,png,pdf.'
    }
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'paper'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

// @route GET /
// @desc Loads form
router.get('/vechile/papers/:vechileid/:token',auth, async(req, res) => {
  try {
    const vechile = await Vechile.find({_id : req.params.vechileid , owner : req.user})
    if (!vechile) {
      return req.status(400).send({error : 'No such vechile associated with the vechile'})
    }
  let paper = await Paper.find({ vechileid : req.params.vechileid})
  paper = paper[0]
  res.render('paper/uploadPaper', {token : req.token,user : req.user,vechileid : req.params.vechileid ,paper : paper })
  } catch (error) {
    res.status(400).send({error : error})
  }
});

// @route POST /upload
// @desc  Uploads file to DB
router.post('/uploadpaper/pollution/:vechileid/:token',auth,upload.single('file'), async (req, res) => {
  try {
    const vechile = await Vechile.find({_id : req.params.vechileid , owner : req.user})
    if (!vechile) {
      return req.status(400).send({error : 'No such vechile associated with the vechile'})
    }
  // res.json({ file: req.file });
  if (req.error) {
      return res.status(400).json({err : req.error})
  }
  let paper = await Paper.find({ vechileid : req.params.vechileid})
  paper = paper[0]
    if (!paper) {
       paper = new Paper({
        pollution : {
          date : req.body.pollution,
          imagefilename : req.file.filename,
          imagefileid : req.file.id
        },
        vechileid : req.params.vechileid
      })
    }
    if (paper) {
      if (paper.pollution.imagefileid) {
        gfs.remove({ _id: paper.pollution.imagefileid, root: 'paper' }, (err, gridStore) => {
          if (err) {
            return res.status(404).json({ err: 'Internal Server Issue' });
          }
        });
      }      
      paper.pollution = {
        date : req.body.pollution,
        imagefilename : req.file.filename,
        imagefileid : req.file.id
      }
    }
    await paper.save()
    res.redirect('/vechile/papers/'+req.params.vechileid+'/'+req.token);
  } catch (error) {
    res.status(400).send({error : error})
  }
});

router.post('/uploadpaper/authorityletter/:vechileid/:token',auth,upload.single('file'), async (req, res) => {
  try {
    const vechile = await Vechile.find({_id : req.params.vechileid , owner : req.user})
    if (!vechile) {
      return req.status(400).send({error : 'No such vechile associated with the vechile'})
    }
  // res.json({ file: req.file });
  if (req.error) {
      return res.status(400).json({err : req.error})
  }
  let paper = await Paper.find({ vechileid : req.params.vechileid})
  paper = paper[0]
    if (!paper) {
       paper = new Paper({
        authorityletter : {
          date : req.body.authorityletter,
          imagefilename : req.file.filename,
          imagefileid : req.file.id
        },
        vechileid : req.params.vechileid
      })
    }
    if (paper) {
      if (paper.authorityletter.imagefileid) {
        gfs.remove({ _id: paper.authorityletter.imagefileid, root: 'paper' }, (err, gridStore) => {
          if (err) {
            return res.status(404).json({ err: 'Okayyy' });
          }
        });
      }
      paper.authorityletter = {
        date : req.body.authorityletter,
        imagefilename : req.file.filename,
        imagefileid : req.file.id
      }
    }
    await paper.save()
    res.redirect('/vechile/papers/'+req.params.vechileid+'/'+req.token);
  } catch (error) {
    res.status(400).send({error : error})
  }
});

// @route GET /files
// @desc  Display all files in JSON
router.get('/files', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      });
    }

    // Files exist
    return res.json(files);
  });
});

// @route GET /files/:filename
// @desc  Display single file object
router.get('/files/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    // File exists
    return res.json(file);
  });
});

// @route GET /image/:filename
// @desc Display Image
router.get('/paperimage/:filename/:token',auth, (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    const readstream = gfs.createReadStream(file.filename);
    readstream.pipe(res);
  });
});

// @route DELETE /files/:id
// @desc  Delete file
router.post('/files/deletepollutionimage/:vechileid/:id/:token',auth, async(req, res) => {
  const vechile = await Vechile.find({_id : req.params.vechileid , owner : req.user})
    if (!vechile) {
      return req.status(400).send({error : 'No such vechile associated with the vechile'})
    }
  gfs.remove({ _id: req.params.id, root: 'paper' }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    }
  });
  let paper = await Paper.find({vechileid : req.params.vechileid})
  paper = paper[0]
  paper.pollution = {
    date : paper.pollution.date,
    imagefilename : null,
    imagefileid : null
  }
  await paper.save()
  res.redirect('/vechile/papers/'+req.params.vechileid+'/'+req.token);
});


module.exports = router