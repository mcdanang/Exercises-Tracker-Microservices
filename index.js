const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
  (mongoose.connection.readyState === 1) ? status = "MongoDB online" : status = "MongoDB offline"
  console.log(status)
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

const exSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: String,
});

const userSchema = new mongoose.Schema({
  username: {type: String, required: true},
  count: { type: Number },
  log: [exSchema]
});

const User = mongoose.model("User", userSchema);
const Exercise = mongoose.model("Exercise", exSchema);

// create a new username
app.post('/api/users', async (req, res) => {
  const userName = req.body.username;
  const userExist = await User.exists({username: userName}, async (err, doc) => {
    if (err) { console.log(err) }
    
    console.log('is user exist?: ' + !!doc);
    if (!!doc) {
      res.json({
        username: userName,
        _id: doc._id
      });
    } else {
      const newUserName = await User.create({
        username: userName
      });
      console.log("new user has been added to database")
      const doc = await User.findOne({username: userName});
      res.json({
        username: doc.username,
        _id: doc._id
      }); 
    }
  });
});

app.get('/api/users', async (req, res) => {
  const doc = await User.find({}, {log: 0}).then( (users) => {
    res.send(users);
  });
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  let date = new Date(req.body.date);
  
  if(date == 'Invalid Date'){
    date = new Date(Date.now());
  }
  
  const id = req.params._id;
  console.log(id, description, duration, date);

  const exercise = new Exercise({
    description: description,
    duration: duration,
    date: date.toDateString(),
  });
  
  const doc = await User.findOneAndUpdate({_id: id}, {$push: {log: exercise}});
  res.json({
    _id: doc._id,
    username: doc.username,
    date: date.toDateString(),
    duration: duration,
    description: description
  });
});

app.get('/api/users/:_id/logs', async (req, res) => {
  const id = req.params._id;
  const fields = { '__v': 0, 'log._id': 0 };
  const doc = await User.findById({_id: id}).select(fields).then( (result) => {
    if (req.query.from || req.query.to) {
      let fromDate = new Date(0);
      let toDate = new Date();

      if (req.query.from) {
        fromDate = new Date(req.query.from);
      }
      
      if (req.query.to) {
        toDate = new Date(req.query.to);
      }

      console.log(fromDate, toDate);

      fromDate = fromDate.getTime();
      toDate = toDate.getTime();

      console.log(fromDate, toDate);
      
      result.log = result.log.filter( (session) => {
        let sessionDate = new Date(session.date).getTime();
        return sessionDate >= fromDate && sessionDate <= toDate;
      });
    }
    if (req.query.limit) {
      result.log = result.log.slice(0, req.query.limit);
    }
    result.count = result.log.length;
    res.json(result);
  });
});