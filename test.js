const nodemailer = require("nodemailer");
const multer = require('multer')


// //This is to store images

// const upload = multer({
//     limits : {
//         fileSize : 1000000
//     },
//     fileFilter(req,file,cb) {
//         if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
//             return cb( new Error('Please upload an image file.'))
//         }
//         cb(undefined,true)
//     }
// })

// router.post('/users/me/avatar',upload.single('avatar'),async(req,res)=>{
    
//     const buffer = await sharp(req.file.buffer).resize({width : 250 , height : 250}).png().toBuffer()
    
//     req.user.avatar = buffer
//     await req.user.save()
//     res.send()
// },async (error,req,res,next)=>{
//     res.status(400).send({error: error.message})
// })

// router.delete('/users/me/avatar',async(req,res)=>{
//     req.user.avatar = undefined
//     await req.user.save()
//     res.send()
// })

// router.get('/users/:id/avatar', async (req,res)=>{
//     try {
//         const user = await User.findById(req.params.id)

//         if (!user || !user.avatar) {
//             throw new Error
//         }
//         res.set('Content-Type','image/png')
//         res.send(user.avatar)
//     } catch (e) {
//         res.status(404).send()
//     }
// })

//Below is for mail


// async function main() {
//   let transporter = nodemailer.createTransport({
//         service: 'Gmail',
//         auth: {
//             user: 'sarthakag.sa@gmail.com',
//             pass: 'Tintin@123'
//         }
//     });
//     let date1 = new Date("06/30/2019"); 
//     let date2 = new Date("08/12/2019"); 
      
//     // To calculate the time difference of two dates 
//     let Difference_In_Time = date2.getTime() - date1.getTime(); 
      
//     // To calculate the no. of days between two dates 
//     let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
//     if (Difference_In_Days <= 30) {
//         return console.log(Difference_In_Days);
//     }
//     console.log('time is there brother');
//   let info = await transporter.sendMail({
//     from: 'sarthakag.sa@gmail.com',
//     to: 'sarthakag.sa@gmail.com,kurseongcarrierspvtltd@yahoo.in',
//     subject: 'hello world!',
//     text: 'hello world!'
//   });
// }

// main().catch(console.error);


//Trying New Way for mailing

// const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// These id's and secrets should come from .env file.
const CLIENT_ID = '585442543620-7io9ndl3enfs9jktc7r2k0cme4rm6n9t.apps.googleusercontent.com';
const CLEINT_SECRET = 'Gs0UrtE6eWSj4ef3_-E7SOaq';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04HPBt-xwyhraCgYIARAAGAQSNwF-L9Ir72qkJN1bBEMGLbIcSNGvaWvSB6dEYu9ka7DoLAUF2OgQkd9UMBcKLraiJzcjMZr-Xew';

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail() {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'sarthakag.sa@gmail.com',
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: 'TRANSWIFT <sarthakag.sa@gmail.com>',
      to: 'sarthakag.sa@gmail.com',
      subject: 'Hello from gmail using API',
      text: 'Hello from gmail email using API',
      html: '<h1>Hello from gmail email using API</h1>',
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}

sendMail()
  .then((result) => console.log('Email sent...', result))
  .catch((error) => console.log(error.message));
