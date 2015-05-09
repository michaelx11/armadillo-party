var Firebase = require('firebase');
var authConfig = require('./authConfig.js');
var root = new Firebase(authConfig.firebaseURL);
root.auth(authConfig.firebaseSecret);

/* Schema
 *
 * 6885:
 *  currentGame: 0
 *  games:
 *    0:
 *      id: RandomUniqIdStr
 *      counter: 2
 *      words:
 *        0:
 *          word: hello
 *          result: yes
 *          verified: yes
 *        1:
 *          word: bob
 *          result: undecided
 *          verified: no
 *        ...
 *    ...
 */
function genSecret(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i=0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

exports.getCurrentGameIndex = function(cbData) {
  root.child('currentGame').once('value', function(data) {
    var index = data.val();
    cbData(index - 1);
  });
}

exports.getGame = function(index, cbDataError) {
  root.child('games').child(index).once('value', function(data) {
    var gameData = data.val();
    if (!gameData) {
      cbDataError(null, "No game with index: " + index + " was found.");
      return;
    } 

    cbDataError(gameData, false);
  });
}

exports.createGame = function(cbDataError) {
  root.child('currentGame').transaction(function(gameIndex) {
    return gameIndex + 1;
  }, function(err, committed, snapshot) {
    if (err) {
      cbDataError(false, "Error in transaction on currentGame index. -> " + err);
      return;
    }

    if (!committed) {
      cbDataError(false, "Error: transaction on currentGame index not committed.");
      return;
    }

    var index = snapshot.val() - 1;
    var newGameObj = {id: index, counter: 0};

    root.child('games').child(index).set(newGameObj);
    cbDataError(snapshot.val(), false);
  });
}

// Adds a word to the wordlist, returns the word index
exports.addWord = function(gameIndex, word, cbDataError) {
  root.child('games').child(gameIndex).child('counter').transaction(function(counter) {
    return counter + 1;
  }, function(err, committed, snapshot) {
    if (err) {
      cbDataError(false, "Error: transaction on addWord failed with error - " + err);
      return;
    }

    if (!committed) {
      cbDataError(false, "Error: transaction on addWord not committed.");
      return;
    }

    var counter = snapshot.val() - 1;
    var wordObj = {"word": word, result: "undecided", verified: "no"};

    root.child('games').child(gameIndex).child('words').child(counter).set(wordObj);
    cbDataError(counter, false);
  });
}

// Update status of a word
exports.updateWordResult = function(gameIndex, wordIndex, newResult, cbError) {
  root.child('games').child(gameIndex).child('words').child(wordIndex).child('result').set(newResult, function(error) {
    cbError(error);
  });
}

// Updates the game with new results
exports.updateGame = function(gameIndex, newWords, cbError) {
  root.child('games').child(gameIndex).child('words').set(newWords);
  cbError(false);
}
