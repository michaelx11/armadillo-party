// Main javascript functions for armadillo-party

function createWordEntry(word, result, index) {
  var entry = document.createElement('li');
  var color = "green";
  if (result !== 'yes') {
    color = "red";
  }
  var functionString = 'correctGuess("' + word + '", "' + result + '", ' + index + ');';
  entry.innerHTML = word + ' is <span style="color:' + color + '">' + result +
    '</span> <button type="button" onclick=\'' + functionString + '\'>Flip!</button>';
  return entry;
}

function getAndUpdateWordList() {
  $.get('/words').done(function(data) {
    if (!data.error) {
      console.log("updating words!");
      var list = document.getElementById("word-list");
      while(list.firstChild) {
        list.removeChild(list.firstChild);
      }
      for (var id in data) {
        var wordObj = data[id];
        var word = wordObj.word;
        var result = wordObj.result;
        list.appendChild(createWordEntry(word, result, id));
      }
    }
  });
}

function submitWord(form) {
  console.log(form);
  console.log(form.word);
  console.log(form.word.value);
  if (form.word.value) {
    $.post("/submitword", {word: form.word.value}).done(function(data) {
      var list = document.getElementById("word-list");
      console.log("GOT THE WORD");
      getAndUpdateWordList();
      /*
      console.log(list);
      list.appendChild(createWordEntry(form.word.value, data));
      console.log(data);
      */
      return false;
    });
  }
  var blank = document.getElementById("word-blank");
  blank.value = "";
  return false;
}


function updateGame() {
  $.get("/updategame");
}

function correctGuess(word, result, index) {
  var newresult = 'yes';
  if (result === "yes") {
    newresult = 'no';
  }
  $.get('/updateword', {word: word, newresult: newresult, index: index}).done(function(data) {
    getAndUpdateWordList();
  });
}

function newGame() {
  $.get('/newgame').done(function(data) {
    getAndUpdateWordList();
  });
}

getAndUpdateWordList();
