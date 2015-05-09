var express = require('express');
var http = require('express');
var hbs = require('hbs');
var passport = require('passport');
//var LocalStrategy = require('passport-local').Strategy;
var model = require('./model');

/*
passport.use(new LocalStrategy(
  function(username, password, done) {
    model.findUser({username: username}, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));
*/

var app = express();

app.set('port', 9010);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);

app.use(express.cookieParser());
app.use(express.logger('dev'));
app.use(express.bodyParser({limit: '10gb'}));
app.use(express.methodOverride());
app.use(express.static(__dirname + '/public'));
app.use(express.session({ secret: 'SECRET' }));
//app.use(passport.initialize());
//app.use(passport.session());

app.use(app.router);

hbs.registerPartial('entryRow', '<li>{{word}} is <span style="color:{{color}}">{{guess}}</span>  <button type="button" onclick="correctGuess({{index}})">Flip!</button></li>\n');

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/*
app.post('/login',
  passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login'})
  function(req, res) {
    res.redirect('/');
  });
*/

app.get('/', function(req, res) {
  var data = {entry: [{word: 'Michael', color: "green", guess: "YES", index: 0}, {word: 'Minerva', color: "red", guess: "NO", index: 1}]};
  res.render('index', data);
});

app.post('/submitword', function(req, res) {
  console.log("GOT POST REQ");
  var word = req.body.word;
  console.log(word);
  model.addWord(word, function(result, err) {
    if (err) {
      console.log('sending!');
      res.send({result: 'yes'});
    } else {
      console.log('sending 2!');
      res.send({result: result});
    }
  });
});

app.get('/words', function(req, res) {
  model.getWords(function(words, err) {
    if (err) {
      res.send({error: err});
      return;
    }
    res.send(words);
  });
});

app.get('/updateword', function(req, res) {
  var word = req.query.word;
  var newresult = req.query.newresult;
  var index = req.query.index;
  if (!(word && newresult)) {
    res.send({error: "incorrect query parameters"});
  } else {
    model.updateWord(word, newresult, index, function(error) {
      if (error) {
        res.send({error: error});
      } else {
        res.end();
      }
    });
  }
});

app.get('/updategame', function(req, res) {
  model.updateGame(function(error) {
    res.send({error: error});
  });
});

app.get('/newgame', function(req,res) {
  model.createGame(function(data, error) {
    res.send({error: error});
  });
});

/*
app.post('/upload', function(req, res) {
  model.uploadFile(req.files.filedata, function(error, data) {
    if (error) {
      console.log("error: " + error);
    }
    res.end();
//    res.send(data);
  });
});

app.get('/list', function(req, res) {
  res.setHeader('Content-Type: text/plain'), 
  res.write(model.getList(req, res));
  res.end();
});

app.get('/download', function(req, res) {
  model.getFile(req, res);
});
/*
app.get('/:id', function(req, res) {
  model.getFile(req, res);
});
*/


app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
