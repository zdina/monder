// Express
var express = require('express');
var app = express();
var cors = require('cors');

app.use(cors());
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
                  FROM recommendation r, movie m \
                  WHERE r.user_id=$1 AND r.movie_id=m.movie_id \
                  ORDER BY r.score DESC \
                  LIMIT 10;', [uid], function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      if (result.rows.length > 0) {
        // trololololo do stuff with recommendations
        res.send(result.rows);
      } else {
        res.send('oops this is embarassing :/ no recommendations');
      }
      client.end();
    });
  });
};

monder.loadTwo = function(res, uid1, uid2) {
  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    client.query('SELECT m.* \
                  FROM recommendation r, movie m \
                  WHERE (r.user_id=$1 OR r.user_id=$2) AND r.movie_id=m.movie_id \
				  GROUP BY m.movie_id \
                  ORDER BY sum(r.score) DESC \
                  LIMIT 10;', [uid1,uid2], function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      if (result.rows.length > 0) {
        // trololololo do stuff with recommendations
        res.send(result.rows);
      } else {
        res.send('oops this is embarassing :/ no recommendations');
      }
      client.end();
    });
  });
};

monder.actors = function(res, mid) {
  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    client.query('SELECT p.* \
                  FROM person p, movie_actor ma \
                  WHERE ma.movie_id=$1 p.person_id=ma.actor_id \
                  ORDER BY p.lastname DESC;', [mid], function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      if (result.rows.length > 0) {
        res.send(result.rows);
      } else {
        res.send([]);
      }
      client.end();
    });
  });
};

monder.directors = function(res, mid) {
  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    client.query('SELECT p.* \
                  FROM person p, movie_director md \
                  WHERE md.movie_id=$1 p.person_id=md.director_id \
                  ORDER BY p.lastname DESC;', [mid], function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      if (result.rows.length > 0) {
        res.send(result.rows);
      } else {
        res.send([]);
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

app.get('/getRecommendations/*', function(req, res) {
  var user = req.params[0];
  console.log(user);
  monder.load(res, user);
});

app.get('/getRecommendations/*/*', function(req, res) {
  var user1 = req.params[0];
  var user2 = req.params[1];
  console.log(user1);
  console.log(user2);
  monder.loadTwo(res, user1, user2);
});

app.get('/getActors/*', function(req, res) {
  var mid = req.params[0];
  console.log(mid);
  monder.actors(res, mid);
});

app.get('/getDirectors/*', function(req, res) {
  var mid = req.params[0];
  console.log(mid);
  monder.directors(res, mid);
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
