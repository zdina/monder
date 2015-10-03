// Express
var express = require('express');
var app = express();
// PythonShell
var PythonShell = require('python-shell');
// DB
var pg = require('pg');
var dbuser = 'dinazverinski';
var dbpass = 'pg';
var conString = 'postgres://' + dbuser + ':' + dbpass + '@localhost/monderdb';

var monder = {};

monder.getUserId = function(res, username) {
  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    client.query('SELECT user_id \
                  FROM app_user \
                  WHERE name=$1;', [username], function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      if (result.rows.length > 0) {
        res.send(result.rows[0].user_id);
      } else {
        res.send('User does not exist');
      }
      client.end();
    });
  });
};

monder.load = function(res, uid) {
  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    client.query('SELECT * \
                  FROM recommendation \
                  WHERE user_id=$1 \
                  ORDER BY score DESC \
                  LIMIT 10;', [uid], function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      if (result.rows.length > 0) {
        // trololololo do stuff with recommendations
        res.send(result.rows[0].movie_id);
      } else {
        res.send('oops this is embarassing :/ no recommendations');
      }
      client.end();
    });
  });
};

monder.feedback = function(res, uid, mid, feedback) {
  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    client.query('INSERT INTO user_movie \
                  VALUES ($1, $2, $3);',
                  [uid, mid, feedback], function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      client.end();
    });
  });
  res.send('done');
};

// training model for current user
monder.init = function(res, uid) {
  var pythonOptions = {
    scriptPath: '../ML',
    args: [uid]
  };

  PythonShell.run('train.py', pythonOptions, function (err) {
    if (err) throw err;
    // results is an array consisting of messages collected during execution 
    console.log('training done');
    res.send('training done');
  });
};

// start restful services
app.get('/getUserId/*', function(req, res) {
  var user = req.params[0];
  console.log(user);
  monder.getUserId(res, user);
});

app.get('/init/*', function(req, res) {
  var user = req.params[0];
  console.log(user);
  monder.init(res, user);
});

app.get('/load/*', function(req, res) {
  var user = req.params[0];
  console.log(user);
  monder.load(res, user);
});

app.get('/feedback/*/*/*', function(req, res) {
  var user = req.params[0];
  var movie = req.params[1];
  var feedback = req.params[2];
  monder.feedback(res, user, movie, feedback);
});

var server = app.listen(8080, function() {
  console.log('server listening :p');
});
