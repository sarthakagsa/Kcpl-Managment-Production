const express = require('express');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const router = new express.Router()
const auth = require('../middleware/auth')
const Vechile = require('../models/vechile');
const Paper = require('../models/paper');
const nodemailer = require("nodemailer");
const { google } = require('googleapis');

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
    if (req.file) {
      paper = new Paper({
        authorityletter : {
          date : req.body.authorityletter,
          imagefilename : req.file.filename,
          imagefileid : req.file.id
        },
        vechileid : req.params.vechileid
      })
    }
    else {
      paper = new Paper({
        authorityletter : {
          date : req.body.authorityletter
        },
        vechileid : req.params.vechileid
      })
    }
  }
    if (paper) {
      if (req.file) {
        if (paper.authorityletter) {
          if (paper.authorityletter.imagefileid) {
            gfs.remove({ _id: paper.authorityletter.imagefileid, root: 'paper' }, (err, gridStore) => {
              if (err) {
                return res.status(404).json({ err: 'Error Removing the Existing Pictures' });
              }
            });
          }
        }
        paper.authorityletter = {
          date : req.body.authorityletter,
          imagefilename : req.file.filename,
          imagefileid : req.file.id
        }
      }
      else {
        if (paper.authorityletter) {
          if (paper.authorityletter.imagefileid) {
            paper.authorityletter = {
              date : req.body.authorityletter,
              imagefilename : paper.authorityletter.imagefilename,
              imagefileid : paper.authorityletter.imagefileid
            }
          }
          else {
            paper.authorityletter = {
              date : req.body.authorityletter
            }
          }
        }
        else {
          paper.authorityletter = {
            date : req.body.authorityletter
          }
        }        
      }
    }
    await paper.save()
    res.redirect('/vechile/papers/'+req.params.vechileid+'/'+req.token);
  } catch (error) {
    res.status(400).send({error : error})
  }
});

router.post('/uploadpaper/insurance/:vechileid/:token',auth,upload.single('file'), async (req, res) => {
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
    if (req.file) {
      paper = new Paper({
        insurance : {
          date : req.body.insurance,
          imagefilename : req.file.filename,
          imagefileid : req.file.id
        },
        vechileid : req.params.vechileid
      })
    }
    else {
      paper = new Paper({
        insurance : {
          date : req.body.insurance
        },
        vechileid : req.params.vechileid
      })
    }
  }
    if (paper) {
      if (req.file) {
        if (paper.insurance) {
          if (paper.insurance.imagefileid) {
            gfs.remove({ _id: paper.insurance.imagefileid, root: 'paper' }, (err, gridStore) => {
              if (err) {
                return res.status(404).json({ err: 'Error Removing the Existing Pictures' });
              }
            });
          }
        }
        paper.insurance = {
          date : req.body.insurance,
          imagefilename : req.file.filename,
          imagefileid : req.file.id
        }
      }
      else {
        if (paper.insurance) {
          if (paper.insurance.imagefileid) {
            paper.insurance = {
              date : req.body.insurance,
              imagefilename : paper.insurance.imagefilename,
              imagefileid : paper.insurance.imagefileid
            }
          }
          else {
            paper.insurance = {
              date : req.body.insurance
            }
          }
        }
        else {
          paper.insurance = {
            date : req.body.insurance
          }
        }        
      }
    }
    await paper.save()
    res.redirect('/vechile/papers/'+req.params.vechileid+'/'+req.token);
  } catch (error) {
    res.status(400).send({error : error})
  }
});

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
      if (req.file) {
        paper = new Paper({
          pollution : {
            date : req.body.pollution,
            imagefilename : req.file.filename,
            imagefileid : req.file.id
          },
          vechileid : req.params.vechileid
        })
      }
      else {
        paper = new Paper({
          pollution : {
            date : req.body.pollution
          },
          vechileid : req.params.vechileid
        })
      }
    }
    if (paper) {
      if (req.file) {
        if (paper.pollution) {
          if (paper.pollution.imagefileid) {
            gfs.remove({ _id: paper.pollution.imagefileid, root: 'paper' }, (err, gridStore) => {
              if (err) {
                return res.status(404).json({ err: 'Error Removing the Existing Pictures' });
              }
            });
          }
        }
        paper.pollution = {
          date : req.body.pollution,
          imagefilename : req.file.filename,
          imagefileid : req.file.id
        }
      }
      else {
        if (paper.pollution) {
          if (paper.pollution.imagefileid) {
            paper.pollution = {
              date : req.body.pollution,
              imagefilename : paper.pollution.imagefilename,
              imagefileid : paper.pollution.imagefileid
            }
          }
          else {
            paper.pollution = {
              date : req.body.pollution
            }
          }
        }
        else {
          paper.pollution = {
            date : req.body.pollution
          }
        }        
      }
    }
    await paper.save()
    res.redirect('/vechile/papers/'+req.params.vechileid+'/'+req.token);
  } catch (error) {
    res.status(400).send({error : error})
  }
});

router.post('/uploadpaper/fitness/:vechileid/:token',auth,upload.single('file'), async (req, res) => {
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
      if (req.file) {
        paper = new Paper({
          fitness : {
            date : req.body.fitness,
            imagefilename : req.file.filename,
            imagefileid : req.file.id
          },
          vechileid : req.params.vechileid
        })
      }
      else {
        paper = new Paper({
          fitness : {
            date : req.body.fitness
          },
          vechileid : req.params.vechileid
        })
      }
    }
    if (paper) {
      if (req.file) {
        if (paper.fitness) {
          if (paper.fitness.imagefileid) {
            gfs.remove({ _id: paper.fitness.imagefileid, root: 'paper' }, (err, gridStore) => {
              if (err) {
                return res.status(404).json({ err: 'Error Removing the Existing Pictures' });
              }
            });
          }
        }
        paper.fitness = {
          date : req.body.fitness,
          imagefilename : req.file.filename,
          imagefileid : req.file.id
        }
      }
      else {
        if (paper.fitness) {
          if (paper.fitness.imagefileid) {
            paper.fitness = {
              date : req.body.fitness,
              imagefilename : paper.fitness.imagefilename,
              imagefileid : paper.fitness.imagefileid
            }
          }
          else {
            paper.fitness = {
              date : req.body.fitness
            }
          }
        }
        else {
          paper.fitness = {
            date : req.body.fitness
          }
        }        
      }
    }
    await paper.save()
    res.redirect('/vechile/papers/'+req.params.vechileid+'/'+req.token);
  } catch (error) {
    res.status(400).send({error : error})
  }
});

router.post('/uploadpaper/statepermit/:vechileid/:token',auth,upload.single('file'), async (req, res) => {
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
      if (req.file) {
        paper = new Paper({
          statepermit : {
            date : req.body.statepermit,
            imagefilename : req.file.filename,
            imagefileid : req.file.id
          },
          vechileid : req.params.vechileid
        })
      }
      else {
        paper = new Paper({
          statepermit : {
            date : req.body.statepermit
          },
          vechileid : req.params.vechileid
        })
      }
    }
    if (paper) {
      if (req.file) {
        if (paper.statepermit) {
          if (paper.statepermit.imagefileid) {
            gfs.remove({ _id: paper.statepermit.imagefileid, root: 'paper' }, (err, gridStore) => {
              if (err) {
                return res.status(404).json({ err: 'Error Removing the Existing Pictures' });
              }
            });
          }
        }
        paper.statepermit = {
          date : req.body.statepermit,
          imagefilename : req.file.filename,
          imagefileid : req.file.id
        }
      }
      else {
        if (paper.statepermit) {
          if (paper.statepermit.imagefileid) {
            paper.statepermit = {
              date : req.body.statepermit,
              imagefilename : paper.statepermit.imagefilename,
              imagefileid : paper.statepermit.imagefileid
            }
          }
          else {
            paper.statepermit = {
              date : req.body.statepermit
            }
          }
        }
        else {
          paper.statepermit = {
            date : req.body.statepermit
          }
        }        
      }
    }
    await paper.save()
    res.redirect('/vechile/papers/'+req.params.vechileid+'/'+req.token);
  } catch (error) {
    res.status(400).send({error : error})
  }
});

router.post('/uploadpaper/nationalpermit/:vechileid/:token',auth,upload.single('file'), async (req, res) => {
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
      if (req.file) {
        paper = new Paper({
          nationalpermit : {
            date : req.body.nationalpermit,
            imagefilename : req.file.filename,
            imagefileid : req.file.id
          },
          vechileid : req.params.vechileid
        })
      }
      else {
        paper = new Paper({
          nationalpermit : {
            date : req.body.nationalpermit
          },
          vechileid : req.params.vechileid
        })
      }
    }
    if (paper) {
      if (req.file) {
        if (paper.nationalpermit) {
          if (paper.nationalpermit.imagefileid) {
            gfs.remove({ _id: paper.nationalpermit.imagefileid, root: 'paper' }, (err, gridStore) => {
              if (err) {
                return res.status(404).json({ err: 'Error Removing the Existing Pictures' });
              }
            });
          }
        }
        paper.nationalpermit = {
          date : req.body.nationalpermit,
          imagefilename : req.file.filename,
          imagefileid : req.file.id
        }
      }
      else {
        if (paper.nationalpermit) {
          if (paper.nationalpermit.imagefileid) {
            paper.nationalpermit = {
              date : req.body.nationalpermit,
              imagefilename : paper.nationalpermit.imagefilename,
              imagefileid : paper.nationalpermit.imagefileid
            }
          }
          else {
            paper.nationalpermit = {
              date : req.body.nationalpermit
            }
          }
        }
        else {
          paper.nationalpermit = {
            date : req.body.nationalpermit
          }
        }        
      }
    }
    await paper.save()
    res.redirect('/vechile/papers/'+req.params.vechileid+'/'+req.token);
  } catch (error) {
    res.status(400).send({error : error})
  }
});

router.post('/uploadpaper/roadtax/:vechileid/:token',auth,upload.single('file'), async (req, res) => {
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
      if (req.file) {
        paper = new Paper({
          roadtax : {
            date : req.body.roadtax,
            imagefilename : req.file.filename,
            imagefileid : req.file.id
          },
          vechileid : req.params.vechileid
        })
      }
      else {
        paper = new Paper({
          roadtax : {
            date : req.body.roadtax
          },
          vechileid : req.params.vechileid
        })
      }
    }
    if (paper) {
      if (req.file) {
        if (paper.roadtax) {
          if (paper.roadtax.imagefileid) {
            gfs.remove({ _id: paper.roadtax.imagefileid, root: 'paper' }, (err, gridStore) => {
              if (err) {
                return res.status(404).json({ err: 'Error Removing the Existing Pictures' });
              }
            });
          }
        }
        paper.roadtax = {
          date : req.body.roadtax,
          imagefilename : req.file.filename,
          imagefileid : req.file.id
        }
      }
      else {
        if (paper.roadtax) {
          if (paper.roadtax.imagefileid) {
            paper.roadtax = {
              date : req.body.roadtax,
              imagefilename : paper.roadtax.imagefilename,
              imagefileid : paper.roadtax.imagefileid
            }
          }
          else {
            paper.roadtax = {
              date : req.body.roadtax
            }
          }
        }
        else {
          paper.roadtax = {
            date : req.body.roadtax
          }
        }        
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
// router.get('/files', (req, res) => {
//   gfs.files.find().toArray((err, files) => {
//     // Check if files
//     if (!files || files.length === 0) {
//       return res.status(404).json({
//         err: 'No files exist'
//       });
//     }

//     // Files exist
//     return res.json(files);
//   });
// });

// @route GET /files/:filename
// @desc  Display single file object
// router.get('/files/:filename', (req, res) => {
//   gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
//     // Check if file
//     if (!file || file.length === 0) {
//       return res.status(404).json({
//         err: 'No file exists'
//       });
//     }
//     // File exists
//     return res.json(file);
//   });
// });

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
router.post('/files/deleteauthorityletterimage/:vechileid/:id/:token',auth, async(req, res) => {
  try {
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
  paper.authorityletter = {
    date : paper.authorityletter.date,
    imagefilename : null,
    imagefileid : null
  }
  await paper.save()
  res.redirect('/vechile/papers/'+req.params.vechileid+'/'+req.token);
  } catch (error) {
    res.status(400).send(error)
  }
});

router.post('/files/deleteinsuranceimage/:vechileid/:id/:token',auth, async(req, res) => {
  try {
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
  paper.insurance = {
    date : paper.insurance.date,
    imagefilename : null,
    imagefileid : null
  }
  await paper.save()
  res.redirect('/vechile/papers/'+req.params.vechileid+'/'+req.token);
  } catch (error) {
    res.status(400).send(error)
  }
});

router.post('/files/deletepollutionimage/:vechileid/:id/:token',auth, async(req, res) => {
  try {
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
  } catch (error) {
    res.status(400).send(error)
  }
});

router.post('/files/deletefitnessimage/:vechileid/:id/:token',auth, async(req, res) => {
  try {
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
  paper.fitness = {
    date : paper.fitness.date,
    imagefilename : null,
    imagefileid : null
  }
  await paper.save()
  res.redirect('/vechile/papers/'+req.params.vechileid+'/'+req.token);
  } catch (error) {
    res.status(400).send(error)
  }
});

router.post('/files/deletestatepermitimage/:vechileid/:id/:token',auth, async(req, res) => {
  try {
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
  paper.statepermit = {
    date : paper.statepermit.date,
    imagefilename : null,
    imagefileid : null
  }
  await paper.save()
  res.redirect('/vechile/papers/'+req.params.vechileid+'/'+req.token);
  } catch (error) {
    res.status(400).send(error)
  }
});

router.post('/files/deletenationalpermitimage/:vechileid/:id/:token',auth, async(req, res) => {
  try {
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
  paper.nationalpermit = {
    date : paper.nationalpermit.date,
    imagefilename : null,
    imagefileid : null
  }
  await paper.save()
  res.redirect('/vechile/papers/'+req.params.vechileid+'/'+req.token);
  } catch (error) {
    res.status(400).send(error)
  }
});

router.post('/files/deleteroadtaximage/:vechileid/:id/:token',auth, async(req, res) => {
  try {
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
  paper.roadtax = {
    date : paper.roadtax.date,
    imagefilename : null,
    imagefileid : null
  }
  await paper.save()
  res.redirect('/vechile/papers/'+req.params.vechileid+'/'+req.token);
  } catch (error) {
    res.status(400).send(error)
  }
});

router.post('/checkpapervalidity/:token',auth,async (req,res)=>{
  try {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLEINT_SECRET,
      process.env.REDIRECT_URI
    );
    oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
    const accessToken = await oAuth2Client.getAccessToken();
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'sarthakag.sa@gmail.com',
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLEINT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });
    let date2 = new Date();
    let dd = String(date2.getDate()).padStart(2, '0');
    let mm = String(date2.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = date2.getFullYear();

    date2 = yyyy + '-' + mm + '-' + dd;

    date2 = new Date(date2)
    const paper = []
    const vechile = await Vechile.find({owner : req.user._id})
    vechile.forEach(async(vechile) => {
      const paperl = await Paper.find({vechileid : vechile._id})
      paper.push(paperl[0])
    });
    await Paper.find()
    paper.forEach(async(papers) => {
      if (papers) {
        if (papers.pollution) {
          if (papers.pollution.date) {
            let date1 = papers.pollution.date
            date1 = new Date(date1)
            let Difference_In_Time = date1.getTime() - date2.getTime();
            let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
            const vechile = await Vechile.findById(papers.vechileid)
            if ((Difference_In_Days <= 30) && (!papers.pollution.notified) ) {
              let info = await transporter.sendMail({
                  to: ''+req.user.email,
                  subject: 'TransSwift - PaperUpdate - '+vechile.vechileno,
                  text: 'The Pollution Paper will expire soon for Vechile No : '+ vechile.vechileno + ' on date : ' +papers.pollution.date
                });
                if (info.messageId) {
                  papers.pollution.notified = true
                }
            }
            let papertobesaved = await Paper.findById(papers._id)
            papertobesaved.pollution = {
              date : papers.pollution.date,
              notified : papers.pollution.notified,
              imagefilename : papers.pollution.imagefilename,
              imagefileid : papers.pollution.imagefileid
            }
            papertobesaved = await papertobesaved.save()
          }
        }
        if (papers.authorityletter) {
          if (papers.authorityletter.date) {
            let date1 = papers.authorityletter.date
            date1 = new Date(date1)
            let Difference_In_Time = date1.getTime() - date2.getTime();
            let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
            const vechile = await Vechile.findById(papers.vechileid)
            if ((Difference_In_Days <= 30) && !(papers.authorityletter.notified) ) {
              let info = await transporter.sendMail({
                  to: ''+req.user.email,
                  subject: 'TransSwift - PaperUpdate - '+vechile.vechileno,
                  text: 'The Authority Letter Paper will expire soon for Vechile No : '+ vechile.vechileno + ' on date : ' +papers.authorityletter.date
                });
                if (info.messageId) {
                  papers.authorityletter.notified = true
                }
            }
            let papertobesaved = await Paper.findById(papers._id)
            papertobesaved.authorityletter = {
              date : papers.authorityletter.date,
              notified : papers.authorityletter.notified,
              imagefilename : papers.authorityletter.imagefilename,
              imagefileid : papers.authorityletter.imagefileid
            }
            papertobesaved = await papertobesaved.save()
          }
        }
        if (papers.insurance) {
          if (papers.insurance.date) {
            let date1 = papers.insurance.date
            date1 = new Date(date1)
            let Difference_In_Time = date1.getTime() - date2.getTime();
            let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
            const vechile = await Vechile.findById(papers.vechileid)
            if ((Difference_In_Days <= 30) && (!papers.insurance.notified) ) {
              let info = await transporter.sendMail({
                  to: ''+req.user.email,
                  subject: 'TransSwift - PaperUpdate - '+vechile.vechileno,
                  text: 'The Insurance Paper will expire soon for Vechile No : '+ vechile.vechileno + ' on date : ' +papers.insurance.date
                });
                if (info.messageId) {
                  papers.insurance.notified = true
                }
            }
            let papertobesaved = await Paper.findById(papers._id)
            papertobesaved.insurance = {
              date : papers.insurance.date,
              notified : papers.insurance.notified,
              imagefilename : papers.insurance.imagefilename,
              imagefileid : papers.insurance.imagefileid
            }
            papertobesaved = await papertobesaved.save()
          }
        }
        if (papers.fitness) {
          if (papers.fitness.date) {
            let date1 = papers.fitness.date
            date1 = new Date(date1)
            let Difference_In_Time = date1.getTime() - date2.getTime();
            let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
            const vechile = await Vechile.findById(papers.vechileid)
            if ((Difference_In_Days <= 30) && (!papers.fitness.notified) ) {
              let info = await transporter.sendMail({
                  to: ''+req.user.email,
                  subject: 'TransSwift - PaperUpdate - '+vechile.vechileno,
                  text: 'The Fitness Paper will expire soon for Vechile No : '+ vechile.vechileno + ' on date : ' +papers.fitness.date
                });
                if (info.messageId) {
                  papers.fitness.notified = true
                }
            }
            let papertobesaved = await Paper.findById(papers._id)
            papertobesaved.fitness = {
              date : papers.fitness.date,
              notified : papers.fitness.notified,
              imagefilename : papers.fitness.imagefilename,
              imagefileid : papers.fitness.imagefileid
            }
            papertobesaved = await papertobesaved.save()
          }
        }
        if (papers.statepermit) {
          if (papers.statepermit.date) {
            let date1 = papers.statepermit.date
            date1 = new Date(date1)
            let Difference_In_Time = date1.getTime() - date2.getTime();
            let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
            const vechile = await Vechile.findById(papers.vechileid)
            if ((Difference_In_Days <= 30) && (!papers.statepermit.notified) ) {
              let info = await transporter.sendMail({
                  to: ''+req.user.email,
                  subject: 'TransSwift - PaperUpdate - '+vechile.vechileno,
                  text: 'The Statepermit Paper will expire soon for Vechile No : '+ vechile.vechileno + ' on date : ' +papers.statepermit.date
                });
                if (info.messageId) {
                  papers.statepermit.notified = true
                }
            }
            let papertobesaved = await Paper.findById(papers._id)
            papertobesaved.statepermit = {
              date : papers.statepermit.date,
              notified : papers.statepermit.notified,
              imagefilename : papers.statepermit.imagefilename,
              imagefileid : papers.statepermit.imagefileid
            }
            papertobesaved = await papertobesaved.save()
          }
        }
        if (papers.nationalpermit) {
          if (papers.nationalpermit.date) {
            let date1 = papers.nationalpermit.date
            date1 = new Date(date1)
            let Difference_In_Time = date1.getTime() - date2.getTime();
            let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
            const vechile = await Vechile.findById(papers.vechileid)
            if ((Difference_In_Days <= 30) && (!papers.nationalpermit.notified) ) {
              let info = await transporter.sendMail({
                  to: ''+req.user.email,
                  subject: 'TransSwift - PaperUpdate - '+vechile.vechileno,
                  text: 'The Nationalpermit Paper will expire soon for Vechile No : '+ vechile.vechileno + ' on date : ' +papers.nationalpermit.date
                });
                if (info.messageId) {
                  papers.nationalpermit.notified = true
                }
            }
            let papertobesaved = await Paper.findById(papers._id)
            papertobesaved.nationalpermit = {
              date : papers.nationalpermit.date,
              notified : papers.nationalpermit.notified,
              imagefilename : papers.nationalpermit.imagefilename,
              imagefileid : papers.nationalpermit.imagefileid
            }
            papertobesaved = await papertobesaved.save()
          }
        }
        if (papers.roadtax) {
          if (papers.roadtax.date) {
            let date1 = papers.roadtax.date
            date1 = new Date(date1)
            let Difference_In_Time = date1.getTime() - date2.getTime();
            let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
            const vechile = await Vechile.findById(papers.vechileid)
            if ((Difference_In_Days <= 30) && (!papers.roadtax.notified )) {
              let info = await transporter.sendMail({
                  to: ''+req.user.email,
                  subject: 'TransSwift - PaperUpdate - '+vechile.vechileno,
                  text: 'The Roadtax Paper will expire soon for Vechile No : '+ vechile.vechileno + ' on date : ' +papers.roadtax.date
                });
                if (info.messageId) {
                  papers.roadtax.notified = true
                }
            }
            let papertobesaved = await Paper.findById(papers._id)
            papertobesaved.roadtax = {
              date : papers.roadtax.date,
              notified : papers.roadtax.notified,
              imagefilename : papers.roadtax.imagefilename,
              imagefileid : papers.roadtax.imagefileid
            }
            papertobesaved = await papertobesaved.save()
          }
        }
      }  
    });  
    res.status(200).send('OKay')
  } catch (error) {
    console.log(error);
    res.status(400).send(error)
  }
})


module.exports = router