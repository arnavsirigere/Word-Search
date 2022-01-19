let dim;
let wordSearch = [];
let pressedTile, releasedTile;
let currentTiles = [];
let words = [];
let renderBoard = false;
let wordsFound = 0;
let definitionP;
let radio, button;
let maxletters, minLetters, totalWords;
let minutes;
let seconds = 59;
let time;
let gameCompleted = false;
let attributions = [];
let attributionP;
let wordnik;
const API_KEY = 'YOUR API KEY HERE';

let displayFireworks = false;
let fireworks = [];
let gravity;
let letter = 'WELLDONE'.split('');
let textCounter = 0;
let font;

function preload() {
  font = loadFont('fonts/ARIMO-ITALIC.ttf');
}

function setup() {
  wordnik = createA('https://wordnik.com', 'Word & Defintion Courtesy by 🧡Wordnik').position(500, 710).style('font-size', '16pt');
  attributionP = createP('');
  radio = createRadio().style('font-size', '32px');
  radio.position(200, 200);
  radio.option(' Easy🟩');
  radio.option(' Medium🟨');
  radio.option(' Hard🟥');
  button = createButton('START').style('font-size', '20px');
  button.position(380, 280);
  // Game settings
  button.mousePressed(() => {
    let val = radio.value();
    if (val == ' Easy🟩') dim = 10;
    else if (val == ' Medium🟨') dim = 15;
    else if (val == ' Hard🟥') dim = 20;
    else dim = 10;
    maxLetters = dim == 10 ? 8 : dim == 15 ? 7 : 9;
    minLetters = dim == 10 ? 4 : dim == 15 ? 5 : 6;
    totalWords = dim == 10 ? 5 : dim == 15 ? 7 : 6;
    minutes = dim == 10 ? 9 : dim == 15 ? 19 : 29;
    // Hide the dom elements
    button.hide();
    radio.hide();
    createCanvas(700, 700);
    colorMode(HSB);
    definitionP = createP('Retrieving Randomized Words & Rendering Board. . .')
      .position(width + 25, 10)
      .style('font-size', '20pt');
    // Fill the word search board with tiles with random letters
    for (let i = 0; i < dim; i++) {
      wordSearch[i] = [];
      for (let j = 0; j < dim; j++) {
        let res = width / dim;
        let char = randomChar();
        let x = i * res;
        let y = j * res;
        wordSearch[i][j] = new Tile(char, x, y, i, j, res);
      }
    }
    initialiseGame();
  });
}

async function getWords(num) {
  let url = `https://api.wordnik.com/v4/words.json/randomWords?hasDictionaryDef=true&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=${minLetters}&maxLength=${maxLetters}&limit=${num}&api_key=${API_KEY}`;
  let response = await fetch(url);
  let data = await response.json();
  let arr = [];
  for (let i = 0; i < data.length; i++) {
    arr[i] = {};
    let word = data[i].word;
    while (/[^A-Za-z]/.test(word)) {
      let singleUrl = `https://api.wordnik.com/v4/words.json/randomWords?hasDictionaryDef=true&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=${minLetters}&maxLength=${maxLetters}&limit=1&api_key=${API_KEY}`;
      let res = await fetch(singleUrl);
      let singleWordData = await res.json();
      word = singleWordData[0].word;
    }
    arr[i].word = word;
  }
  return arr;
}

function draw() {
  if (renderBoard && !displayFireworks) {
    background(255);
    // Draw the tiles
    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        let tile = wordSearch[i][j];
        tile.show();
      }
    }
    if (pressedTile) {
      // Get the tile on which mouse was released
      releasedTile = getCurrentTile();
      if (releasedTile) {
        let tiles = getSelectedTiles();
        if (tiles) {
          highlightTiles(tiles);
        }
      }
    }
  } else if (displayFireworks) {
    push();
    colorMode(RGB);
    background(0, 25);
    pop();
    renderFireworks();
  }
}

function highlightTiles(tiles) {
  for (let tile of tiles) {
    tile.hover = true;
  }
}

function mousePressed() {
  // Get the tile which was pressed on
  pressedTile = getCurrentTile();
}

function getCurrentTile() {
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      let tile = wordSearch[i][j];
      if (tile.isClicked(mouseX, mouseY)) {
        return tile;
      }
    }
  }
}

function mouseReleased() {
  releasedTile = getCurrentTile();
  if (pressedTile && releasedTile) {
    let tiles = getSelectedTiles(); // Get the selected tiles
    if (tiles) {
      evaluateWord(tiles); // Check if selected word is a valid word
    }
  }
  pressedTile = null;
}

function evaluateWord(tiles) {
  // Construct the word which was selected
  let word = '';
  for (let tile of tiles) {
    word += tile.char;
  }
  for (let i = 0; i < words.length; i++) {
    if (words[i].word.toUpperCase() == word || words[i].word.toUpperCase() == word.reverse()) {
      wordsFound++; // Another word has been found
      words[i]['found'] = true;
      let h = words[i].h;
      // Strike out the word
      let div = words[i].div;
      div.style('text-decoration', 'line-through');
      for (let tile of tiles) {
        tile.highlight(h, 255, 255); // Highlight the tiles with the corresponding color
      }
      // Get the definition and display it
      definitionP.html('Retrieving definition . . .');
      getDefinition(words[i].word)
        .then((def) => {
          definitionP.html(def).style('background-color', 'black').style('color', color(h, 255, 255)).style('border-color', color(h, 255, 255)).style('border-width', '5px').style('border-style', 'inset');
        })
        .catch((err) => definitionP.html(err));
    }
  }
  // If all the words have been found
  if (wordsFound == totalWords) {
    gameOver(true);
  }
}

function updateAttributions(attributions) {
  let attributionsElt = document.getElementById('attributions');
  attributionsElt.textContent = '';
  let elt = select('#attributions');
  elt.position(500, 730);
  let heading = document.createElement('h3');
  heading.textContent = 'Attributions';
  attributionsElt.appendChild(heading);
  for (let i = 0; i < attributions.length; i++) {
    let div = document.createElement('div');
    div.textContent = `${i + 1}) ${attributions[i].word} - ${attributions[i].attributionText}`;
    attributionsElt.appendChild(div);
  }
}

async function getDefinition(word) {
  let dUrl = `https://api.wordnik.com/v4/word.json/${word}/definitions?limit=200&includeRelated=false&useCanonical=false&includeTags=false&api_key=${API_KEY}`;
  let dResponse = await fetch(dUrl);
  let defData = await dResponse.json();
  let definition = '';
  let attributionText = '';
  let counter = defData.length - 1;
  while (!definition) {
    definition = defData[counter].text;
    attributionText = defData[counter].attributionText;
    counter--;
  }
  if (/Plural form of .*/.test(definition)) {
    definition = null;
    dUrl = `https://api.wordnik.com/v4/word.json/${word.substring(0, word.length - 1)}/definitions?limit=200&includeRelated=false&useCanonical=false&includeTags=false&api_key=${API_KEY}`;
    dResponse = await fetch(dUrl);
    defData = await dResponse.json();
    counter = defData.length - 1;
    while (!definition) {
      definition = defData[counter].text;
      attributionText = defData[counter].attributionText;
      counter--;
    }
  }
  attributions.push({ attributionText, word });
  updateAttributions(attributions);
  return definition;
}

function randomChar() {
  let c = floor(random(1) * 26) + 97;
  if (c === 63) c = 32;
  if (c === 64) c = 46;
  return String.fromCharCode(c).toUpperCase();
}

String.prototype.reverse = function () {
  return this.split('').reverse().join('');
};

function gameOver(win) {
  gameCompleted = true;
  time.hide();
  definitionP.hide();
  for (let word of words) {
    word.div.hide();
  }
  if (win) {
    displayFireworks = true;
    gravity = createVector(0, 0.2);
    addFirework();
    setInterval(addFirework, 1500);
  } else {
    let p = createP(`Well tried! Unfortunately the timer hit 0😣. You found ${wordsFound} ${wordsFound == 1 ? 'word' : 'words'} and had difficulty finding ${totalWords - wordsFound}😊. Here, let me reveal them for you!`);
    p.style('font-size', '28pt').position(width + 25, 0);
    setTimeout(revealWords, 7000);
  }
}

function timer() {
  if (!gameCompleted) {
    seconds--;
    if (minutes < 1) {
      time.style('color', 'rgb(255,0,0)');
    }
    if (seconds == 0 && minutes > 0) {
      seconds = 59;
      minutes--;
    } else if (seconds == 0 && minutes == 0) {
      gameOver(false);
      gameCompleted = true;
    }
    if (!gameCompleted) {
      time.html(`${minutes} : ${seconds}`);
    }
  }
}

function revealWords() {
  words = words.filter((x) => !x.found);
  for (let i = 0; i < words.length; i++) {
    let ans = words[i].answer;
    let h = words[i].h;
    let col = color(h, 255, 255);
    for (let tile of ans) {
      tile.highlight(col);
    }
  }
}

function addFirework() {
  fireworks.push(new Firework());
}

function renderFireworks() {
  for (var i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].show();
    if (fireworks[i].done()) {
      fireworks.splice(i, 1);
    }
  }
}

function getSelectedTiles() {
  let tiles = [];
  if (releasedTile.y == pressedTile.y) {
    let start = pressedTile.x < releasedTile.x ? pressedTile.i : releasedTile.i;
    let end = start == pressedTile.i ? releasedTile.i : pressedTile.i;
    let row = pressedTile.j;
    for (let i = start; i <= end; i++) {
      let tile = wordSearch[i][row];
      tiles.push(tile);
    }
  } else if (pressedTile.x == releasedTile.x) {
    let start = pressedTile.y < releasedTile.y ? pressedTile.j : releasedTile.j;
    let end = start == pressedTile.j ? releasedTile.j : pressedTile.j;
    let col = pressedTile.i;
    for (let i = start; i <= end; i++) {
      let tile = wordSearch[col][i];
      tiles.push(tile);
    }
  } else if (abs(pressedTile.i - releasedTile.i) == abs(pressedTile.j - releasedTile.j)) {
    if (pressedTile.i > releasedTile.i)
      for (let i = 0; i <= pressedTile.i - releasedTile.i; i++) {
        if (pressedTile.y < releasedTile.y) {
          tile = wordSearch[pressedTile.i - i][pressedTile.j + i];
        } else {
          tile = wordSearch[pressedTile.i - i][pressedTile.j - i];
        }
        tiles.push(tile);
      }
    else {
      for (let i = 0; i <= releasedTile.i - pressedTile.i; i++) {
        if (pressedTile.y > releasedTile.y) {
          tile = wordSearch[pressedTile.i + i][pressedTile.j - i];
        } else {
          tile = wordSearch[pressedTile.i + i][pressedTile.j + i];
        }
        tiles.push(tile);
      }
    }
  }
  if (tiles.length > 0) {
    return tiles;
  }
}

function addWord(board, wordObj) {
  let word = wordObj.word;
  // The answer
  let answer = [];
  // Get random letter from word
  let index = floor(random(word.length));
  let char = word.charAt(index);
  // Array of all tiles in board containing the letter
  let charInstances = [];
  // Get all the tiles containing the letter
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      let tile = board[i][j];
      if (char == tile.char) {
        charInstances.push(tile);
      }
    }
  }
  let wordAdded = false;
  if (charInstances.length > 0) {
    instanceTile = random(charInstances);
  } else {
    instanceTile = random(random(wordSearch));
  }
  let r = random(100);
  if (r > 87.5 && instanceTile.i + word.length - index < 10 && instanceTile.i - index >= 0) {
    let counter = 0;
    let goodToGo = true;
    for (let i = instanceTile.i - index; i < instanceTile.i + (word.length - index); i++) {
      let tile = board[i][instanceTile.j];
      if (tile.valChanged && tile.changedLetter !== word.charAt(counter)) {
        goodToGo = false;
      }
      counter++;
    }
    if (goodToGo) {
      counter = 0;
      for (let i = instanceTile.i - index; i < instanceTile.i + (word.length - index); i++) {
        let tile = board[i][instanceTile.j];
        tile.convert(word, counter);
        answer.push(tile);
        counter++;
      }
      wordAdded = true;
    }
  } else if (r > 75 && instanceTile.j + word.length - index < 10 && instanceTile.j - index >= 0) {
    let counter = 0;
    let goodToGo = true;
    for (let j = instanceTile.j - index; j < instanceTile.j + (word.length - index); j++) {
      let tile = board[instanceTile.i][j];
      if (tile.valChanged && tile.changedLetter !== word.charAt(counter)) {
        goodToGo = false;
      }
      counter++;
    }
    if (goodToGo) {
      counter = 0;
      for (let j = instanceTile.j - index; j < instanceTile.j + (word.length - index); j++) {
        let tile = board[instanceTile.i][j];
        tile.convert(word, counter);
        answer.push(tile);
        counter++;
      }
      wordAdded = true;
    }
  } else if (r > 62.5 && instanceTile.i + word.length - index < 10 && instanceTile.i - index >= 0) {
    let counter = word.length - 1;
    let goodToGo = true;
    for (let i = instanceTile.i - index; i < instanceTile.i + (word.length - index); i++) {
      let tile = board[i][instanceTile.j];
      if (tile.valChanged && tile.changedLetter !== word.charAt(counter)) {
        goodToGo = false;
      }
      counter--;
    }
    if (goodToGo) {
      counter = word.length - 1;
      for (let i = instanceTile.i - index; i < instanceTile.i + (word.length - index); i++) {
        let tile = board[i][instanceTile.j];
        tile.convert(word, counter);
        answer.push(tile);
        counter--;
      }
      wordAdded = true;
    }
  } else if (r > 50 && instanceTile.j + word.length - index < 10 && instanceTile.j - index >= 0) {
    let counter = word.length - 1;
    let goodToGo = true;
    for (let j = instanceTile.j - index; j < instanceTile.j + (word.length - index); j++) {
      let tile = board[instanceTile.i][j];
      if (tile.valChanged && tile.changedLetter !== word.charAt(counter)) {
        goodToGo = false;
      }
      counter--;
    }
    if (goodToGo) {
      counter = word.length - 1;
      for (let j = instanceTile.j - index; j < instanceTile.j + (word.length - index); j++) {
        let tile = board[instanceTile.i][j];
        tile.convert(word, counter);
        answer.push(tile);
        counter--;
      }
      wordAdded = true;
    }
  } else if (r > 37.5 && instanceTile.i + word.length - index < 10 && instanceTile.j + word.length - index < 10 && instanceTile.i - index >= 0 && instanceTile.j - index >= 0) {
    let counter = 0;
    let goodToGo = true;
    for (let i = -index; i < word.length - index; i++) {
      let tile = board[instanceTile.i + i][instanceTile.j + i];
      if (tile.valChanged && tile.changedLetter !== word.charAt(counter)) {
        goodToGo = false;
      }
      counter++;
    }
    if (goodToGo) {
      counter = 0;
      for (let i = -index; i < word.length - index; i++) {
        let tile = board[instanceTile.i + i][instanceTile.j + i];
        tile.convert(word, counter);
        answer.push(tile);
        counter++;
      }
      wordAdded = true;
    }
  } else if (r > 25 && instanceTile.i + word.length - index < 10 && instanceTile.j + word.length - index < 10 && instanceTile.i - index >= 0 && instanceTile.j - index >= 0) {
    let counter = word.length - 1;
    let goodToGo = true;
    for (let i = -index; i < word.length - index; i++) {
      let tile = board[instanceTile.i + i][instanceTile.j + i];
      if (tile.valChanged && tile.changedLetter !== word.charAt(counter)) {
        goodToGo = false;
      }
      counter--;
    }
    if (goodToGo) {
      counter = word.length - 1;
      for (let i = -index; i < word.length - index; i++) {
        let tile = board[instanceTile.i + i][instanceTile.j + i];
        tile.convert(word, counter);
        answer.push(tile);
        counter--;
      }
      wordAdded = true;
    }
  } else if (r > 12.5 && instanceTile.i + index < 10 && instanceTile.i + (index - word.length) >= 0 && instanceTile.j - index >= 0 && instanceTile.j - (index - word.length) < 10) {
    let counter = 0;
    let goodToGo = true;
    for (let i = index; i > index - word.length; i--) {
      let tile = board[instanceTile.i + i][instanceTile.j - i];
      if (tile.valChanged && tile.changedLetter !== word.charAt(counter)) {
        goodToGo = false;
      }
      counter++;
    }
    if (goodToGo) {
      counter = 0;
      for (let i = index; i > index - word.length; i--) {
        let tile = board[instanceTile.i + i][instanceTile.j - i];
        tile.convert(word, counter);
        answer.push(tile);
        counter++;
      }
      wordAdded = true;
    }
  } else if (instanceTile.i + index < 10 && instanceTile.i + (index - word.length) >= 0 && instanceTile.j - index >= 0 && instanceTile.j - (index - word.length) < 10) {
    let counter = word.length - 1;
    let goodToGo = true;
    for (let i = index; i > index - word.length; i--) {
      let tile = board[instanceTile.i + i][instanceTile.j - i];
      if (tile.valChanged && tile.changedLetter !== word.charAt(counter)) {
        goodToGo = false;
      }
      counter--;
    }
    if (goodToGo) {
      counter = word.length - 1;
      for (let i = index; i > index - word.length; i--) {
        let tile = board[instanceTile.i + i][instanceTile.j - i];
        tile.convert(word, counter);
        answer.push(tile);
        counter--;
      }
      wordAdded = true;
    }
  }
  wordObj['answer'] = answer;
  if (!wordAdded) {
    addWord(board, wordObj);
  }
}

function initialiseGame() {
  // Get words from wordNik
  getWords(totalWords)
    .then((data) => {
      words = data;
      // Create div element for words & assign each word a random color
      for (let i = 0; i < words.length; i++) {
        h = random(255);
        words[i]['h'] = h;
        let div = createDiv(`${i + 1} - ${words[i].word.toUpperCase()}`)
          .style('color', color(h, 255, 255))
          .style('font-size', '32px')
          .style('background-color', 'black')
          .style('width', dim == 10 ? '200pt' : '300pt');
        words[i]['div'] = div;
      }
      // Put the words in the word search board
      try {
        for (let i = 0; i < words.length; i++) {
          addWord(wordSearch, words[i]);
        }
        definitionP.html('');
      } catch (err) {
        console.log(err);
        definitionP.html("Oops, the words couldn't be added to the board.<br>Maybe try refreshing the page 🤷🏼‍♂️").style('color', 'rgb(255,0,0)');
      }
      renderBoard = true;
      // The timer!
      time = createP(`${minutes} : ${seconds}`)
        .style('font-size', '48px')
        .position(width + 100, 500)
        .style('border-width', '10px')
        .style('border-style', 'solid')
        .style('border-color', 'black');
      // Start updating the timer
      setInterval(timer, 1000);
    })
    .catch((err) => definitionP.html(err));
}
