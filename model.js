var fs = require('fs');
var http = require('http');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var firebase = require('./firebase')

/*
firebase.createGame(function(gameIndex, error) {
  if (error) {
    console.log(error);
    return;
  }
  console.log('Game index: ' + gameIndex);
});
*/

/*
firebase.getCurrentGameIndex(function(gameIndex) {
  console.log(gameIndex);
});
*/

/*
firebase.addWord(0, 'hello', function(wordIndex, error) {
  console.log(wordIndex);
});
*/

/*
firebase.updateWordResult(0, 0, 'yes', function(error) {
});
*/
exec('mkdir -p sketches');
exec('mkdir -p sketch_output');
exec('mkdir -p rule_programs');

var SKETCH_ENV = process.env;
SKETCH_ENV['SKETCH_HOME'] = '/home/ubuntu/6.885/sketch-1.6.9/sketch-frontend/runtime';
SKETCH_ENV['PATH'] += ':/home/ubuntu/6.885/sketch-1.6.9/sketch-frontend';
function runSketch(gameObj, cbError) {
  // This step is necessary to determine the number of valid test cases
  // [{word: hello, result: yes}, {...}, ...]
  var inputString = "";
  var testCases = [];
  for (var i = 0; i < gameObj.counter; i++) {
    var wordObj = gameObj.words[i];
    if (!wordObj) {
      continue;
    }

    if (wordObj.result != 'undecided') {
      testCases.push({word: wordObj.word, result: wordObj.result});
    }
  }
  inputString += testCases.length;
  for (var i = 0; i < testCases.length; i++) {
    var testCase = testCases[i];
    inputString += "\n" + testCase.word + " " + testCase.result;
  }

  var p = exec('printf "' + inputString + '" | python synthesizer/run_sketch.py rule' + gameObj.id,
      {env: SKETCH_ENV},
      function(err, stdout, stderr) {
    if (err) {
      console.log(err);
      cbError(err);
      return;
    }

    if (stderr) {
      console.log(stderr.toString());
      cbError(stderr.toString());
      return;
    }

    console.log(stdout.toString());
    runRule(gameObj, "test", function(data, error) {
      cbError(false);
    });
  });
}

function runRule(gameObj, word, cbDataError) {
  var p = exec('printf ' + '"1\\n' + word + '" | python synthesizer/run_rule.py rule' + gameObj.id, function(err, stdout, stderr) {
    if (err) {
      cbDataError(false, err);
      return;
    }

    if (stderr) {
      cbDataError(false, stderr.toString());
      return;
    }

    cbDataError(stdout.toString(), false);
  });
}

function processNewlines(str) {
  str = str.split('--NEWLINE--').join('\n');
  return str
}

exports.getRule = function(cbDataError) {
  firebase.getCurrentGameIndex(function(currentGameIndex) {
    var p = exec('python synthesizer/extract_rule.py rule' + currentGameIndex, function(err, stdout, stderr) {
    if (err) {
      console.log(err);
      cbDataError(false, err);
      return;
    }

    if (stderr) {
      console.log(stderr.toString());
      cbDataError(false, stderr.toString());
      return;
    }

    cbDataError(processNewlines(stdout.toString()), false);
    });
  });
}

exports.addWord = function(word, cbStatusError) {
  firebase.getCurrentGameIndex(function(currentGameIndex) {
    console.log("got current game index");
    firebase.addWord(currentGameIndex, word, function(wordIndex, error) {
      console.log("added word");
      if (error) {
        cbStatusError(false, error);
        return;
      }

      firebase.getGame(currentGameIndex, function(data, error2) {
        console.log("got game");
        if (error2) {
          cbStatusError(false, error2);
          return;
        }

        runRule(data, word, function(result, error3) {
          console.log("ran rule");
          var cleanResult = result;
          if (error3) {
            cleanResult = "yes";
          }

          firebase.updateWordResult(currentGameIndex, wordIndex, cleanResult, function(error4) {
            console.log("updated result");
            if (error4) {
              cbStatusError(false, error4);
              return;
            }

            cbStatusError(result, false);
          });
        });
      });
    });
  });
}

exports.updateGame = function(cbError) {
  firebase.getCurrentGameIndex(function(currentGameIndex) {
    firebase.getGame(currentGameIndex, function(data, error) {
      if (error) {
        cbError(e, error);
        return;
      }

      runSketch(data, function(result, error2) {
        if (error2) {
          cbError(e, error2);
          return;
        }
        cbError(false);
      });
    });
  });
}

exports.getWords = function(cbDataError) {
  firebase.getCurrentGameIndex(function(currentGameIndex) {
    firebase.getGame(currentGameIndex, function(data, error) {
      if (error) {
        cbDataError(false, error);
        return;
      }

      cbDataError(data.words, false);
    });
  });
}

exports.updateWord = function(word, newresult, index, cbError) {
  firebase.getCurrentGameIndex(function(currentGameIndex) {
    firebase.updateWordResult(currentGameIndex, index, newresult, function(error) {
      cbError(error);
    });
  });
}

exports.createGame = firebase.createGame;
