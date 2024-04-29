// DOM elements
const logoLink = elById('logoLink');
const navOpenBtn = elById('navOpenBtn');
const navCloseBtn = elById('navCloseBtn');
const navNewGameBtn = elById('primarySettings');
const navGameBtn = elById('primaryGame');
const navHelpBtn = elById('primaryHelp');
const navLeaderboardBtn = elById('primaryLeaderboard');
const settingStartBtn = elById('settingStartBtn');
const settingCloseBtn = elById('settingCloseBtn');
const playToNewGameBtn = elById('noGameButton');
const soundBtn = elById('soundBtn');
const muteBtn = elById('muteBtn');
const landscapeOkBtn = elById('landscapeOkBtn');
const leaderboardDeleteBtn = elById('leaderboardDeleteBtn');
const successHomeBtn = elById('successHomeBtn');
const failContactBtn = elById('failContactBtn');
const footerContactBtn = elById('footerContactBtn');
const sections = qsa('.section');
const settingsSection = elById('settings');
const gameSection = elById('game');
const leaderboardSection = elById('leaderboard');
const player1TypeCheckbox = elById('player1Type');
const player1ColourCheckbox = elById('player1Colour');
const player2TypeCheckbox = elById('player2Type');
const player2ColourCheckbox = elById('player2Colour');
const boardEl = elById('boardGrid');
let nameEl = elById('name');

// Constant values for the game board grid
const NUM_OF_COLUMN = 7;
const NUM_OF_ROW = 6;

// Variables for the game
let freeCellCounter;
let gameOver;
let playerData;
let player1Turn;
let computerTurn;
let gamePlayed = 0;
let isMuted = true;

const soundEffect = new Audio();
soundEffect.autoplay = true;
// Silent MP3 file
soundEffect.src =
  'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

function runGame() {
  const overlays = qsa('.overlay');
  freeCellCounter = 42;
  gameOver = false;
  computerTurn = false;
  gamePlayed++;

  // Makes the player1 play first in every odd-numbered game.
  if (gamePlayed % 2 === 0) {
    player1Turn = false;
  } else {
    player1Turn = true;
  }

  overlays.forEach(overlay => overlay.remove());
  createGrid();
  updateName(player1Turn ? playerData.player1Name : playerData.player2Name);
  updateColour(player1Turn ? playerData.player1Colour : playerData.player2Colour);

  if (playerData.player1Type === 'human' && playerData.player2Type === 'human') {
    playerMove();
  } else if (
    (playerData.player1Type === 'computer' && player1Turn) ||
    (playerData.player2Type === 'computer' && !player1Turn)
  ) {
    computerMove();
    playerMove();
  } else {
    playerMove();
  }
}

function computerMove() {
  const randomNumber = Math.floor(Math.random() * NUM_OF_COLUMN);
  const freeCell = findFreeCell(randomNumber);
  computerTurn = true;

  if (gameOver) return;
 
  if (!freeCell) {
    return computerMove();
  }

  setTimeout(() => {
    placeDisc(freeCell);
  }, 1000);
}

function playerMove() {
  const cells = qsa('.cell');

  
  const isMobile = window.matchMedia('(hover: none)').matches;

  if (isMobile) {
    for (let cell of cells) {
      cell.addEventListener('click', calculateColIndex);
    }
  } else {
    for (let cell of cells) {
      cell.addEventListener('mouseover', cellMouseoverHandler);
      cell.addEventListener('click', calculateColIndex);
    }
  }
}

/**---------------------------------
  @param {string} pressedKey 
 ----------------------------------*/
function keydownHandler(pressedKey) {
  const cells = qsa('.cell');
  const invisibleCells = qsa('.cell.invisible');
  let visibleCellIndex;

  if (gameOver || gameOver === undefined) return;
  if (computerTurn || computerTurn === undefined) return;

 
  for (let i = 0; i < NUM_OF_COLUMN; i++) {
    if (!cells[i].classList.contains('invisible')) {
      if (pressedKey === 'ArrowLeft' || pressedKey === 'ArrowRight') {
        cells[i].classList.add('invisible');
      }
      visibleCellIndex = i;
    }
  }

  if (pressedKey === 'ArrowLeft') {
    if (invisibleCells.length === NUM_OF_COLUMN - 1 && visibleCellIndex !== 0) {
      return cells[visibleCellIndex - 1].classList.remove('invisible');
    } else {
      return cells[NUM_OF_COLUMN - 1].classList.remove('invisible');
    }
  }
  
  if (pressedKey === 'ArrowRight') {
    if (invisibleCells.length === NUM_OF_COLUMN - 1 && visibleCellIndex !== NUM_OF_COLUMN - 1) {
      return cells[visibleCellIndex + 1].classList.remove('invisible');
    } else {
      return cells[0].classList.remove('invisible');
    }
  }
  if (pressedKey === 'ArrowDown') {
    if (invisibleCells.length === NUM_OF_COLUMN) {
      return;
    } else {
      return cellClickHandler(visibleCellIndex);
    }
  }
}

/**-------------------
 
 * @param {object} event Mouseover event.
 --------------------*/
function cellMouseoverHandler(event) {
  const cells = qsa('.cell');
  const colIndex = cells.indexOf(event.target) % 7;

  if (gameOver || computerTurn) return;

  for (let i = 0; i < NUM_OF_COLUMN; i++) {
    cells[i].classList.add('invisible');
  }
  cells[colIndex].classList.remove('invisible');
}

/**--------------------
 
 * @param {object} event Mouse click event.
 ----------------------*/
function calculateColIndex(event) {
  const cells = qsa('.cell');
  const colIndex = cells.indexOf(event.target) % 7;
  cellClickHandler(colIndex);
}

/**-----------------------
 * @param {number} colIndex The index of the target column.
 ------------------------*/
function cellClickHandler(colIndex) {
  const cells = qsa('.cell');
  const freeCell = findFreeCell(colIndex);

  if (gameOver || computerTurn || !freeCell) return;

  cells[colIndex].classList.add('invisible');
  placeDisc(freeCell);
}

/**---------------------
 * @param {number} colIndex 
 * @returns {object} 
 -------------------------*/
function findFreeCell(colIndex) {
  const cells = qsa(`[data-coords-col="${colIndex}"]`);

  for (let i = cells.length - 1; i >= 0; i--) {
    if (!cells[i].classList.contains('red') && !cells[i].classList.contains('yellow')) {
      return cells[i];
    }
  }
}

/**---------------------
 * @param {object} cell 
 ------------------------------*/
function placeDisc(cell) {
  cell.classList.add(player1Turn ? playerData.player1Colour : playerData.player2Colour);
  cell.textContent = `
    ${player1Turn ? playerData.player1Colour.charAt(0) : playerData.player2Colour.charAt(0)}
  `;
  freeCellCounter--;
  checkGameOver();
}

/**------------------------
 * @returns {function} 
 ---------------------------*/
function checkGameOver() {
  const connected = checkForWin(player1Turn ? playerData.player1Colour : playerData.player2Colour);

  if (connected) {
    const player1Point = 42 - qsa(`.${playerData.player1Colour}`).length + NUM_OF_COLUMN;
    const player2Point = 42 - qsa(`.${playerData.player2Colour}`).length + NUM_OF_COLUMN;
    gameOver = true;
    addToLocalstorage(player1Turn ? playerData.player1Name : playerData.player2Name, player1Turn ? player1Point : player2Point, 1);
    return displayResult('winner', player1Turn ? playerData.player1Name : playerData.player2Name, player1Turn ? player1Point : player2Point, connected);
  } else if (freeCellCounter === 0) {
    gameOver = true;
    addToLocalstorage(player1Turn ? playerData.player1Name : playerData.player2Name, 0, 0);
    return displayResult('draw');
  } else {
    playDropSound();
    updatePlayer();
  }
}

/**------------------
 * @param {string} playerColour 
 * @returns {array} 
 * ---------------------------*/
function checkForWin(playerColour) {
  const cells = qsa('.cell').splice(NUM_OF_COLUMN);

  
  for (let index = 0; index < NUM_OF_ROW * NUM_OF_COLUMN; index++) {
    const horizontalWin = horizontal4Check(index, cells[index], cells[index + 1], cells[index + 2], cells[index + 3], playerColour);
    const verticalWin = vertical4Check(index, cells[index], cells[index + NUM_OF_COLUMN], cells[index + NUM_OF_COLUMN * 2], cells[index + NUM_OF_COLUMN * 3], playerColour);
    const mainDiagonalWin = mainDiagonal4Check(index, cells[index], cells[index + NUM_OF_COLUMN + 1], cells[index + NUM_OF_COLUMN * 2 + 2], cells[index + NUM_OF_COLUMN * 3 + 3], playerColour);
    const offDiagonalWin = offDiagonal4Check(index, cells[index], cells[index + NUM_OF_COLUMN - 1], cells[index + NUM_OF_COLUMN * 2 - 2], cells[index + NUM_OF_COLUMN * 3 - 3], playerColour);

    if (horizontalWin) {
      return horizontalWin;
    }
    if (verticalWin) {
      return verticalWin;
    }
    if (mainDiagonalWin) {
      return mainDiagonalWin;
    }
    if (offDiagonalWin) {
      return offDiagonalWin;
    }
  }
}

/**---------
 * Runs after a disc is placed.
 * @param {number} index
 * @param {object} cell1 
 * @param {object} cell2 
 * @param {object} cell3 
 * @param {object} cell4 
 * @param {string} colour 
 * @returns {array} 
 ------------------------*/
function horizontal4Check(index, cell1, cell2, cell3, cell4, colour) {
  if (
    index % NUM_OF_COLUMN < 4 &&
    checkCellColour(cell1, cell2, cell3, cell4, colour)
  ) {
    return ([cell1, cell2, cell3, cell4]);
  }
}

/**----------------
 * @param {number} index 
 * @param {object} cell1 
 * @param {object} cell2 
 * @param {object} cell3 
 * @param {object} cell4 
 * @param {string} colour 
 * @returns {array} 
 * -------------------------------*/
function vertical4Check(index, cell1, cell2, cell3, cell4, colour) {
  if (
    index < NUM_OF_COLUMN * 3 &&
    checkCellColour(cell1, cell2, cell3, cell4, colour)
  ) {
    return ([cell1, cell2, cell3, cell4]);
  }
}

/**-------------
 * @param {number} index 
 * @param {object} cell1 
 * @param {object} cell2 
 * @param {object} cell3 
 * @param {object} cell4 
 * @param {string} colour 
 * @returns {array} 
 ------------------------*/
function mainDiagonal4Check(index, cell1, cell2, cell3, cell4, colour) {
  if (
    index % NUM_OF_COLUMN < 4 &&
    index < NUM_OF_COLUMN * 3 - 3 &&
    checkCellColour(cell1, cell2, cell3, cell4, colour)
  ) {
    return ([cell1, cell2, cell3, cell4]);
  }
}

/**--------------------
 * @param {number} index 
 * @param {object} cell1 
 * @param {object} cell2 
 * @param {object} cell3 
 * @param {object} cell4 
 * @param {string} colour 
 * @returns {array} 
 --------------------------*/
function offDiagonal4Check(index, cell1, cell2, cell3, cell4, colour) {
  if (
    index % NUM_OF_COLUMN >= 3 &&
    index < NUM_OF_COLUMN * 3 &&
    checkCellColour(cell1, cell2, cell3, cell4, colour)
  ) {
    return ([cell1, cell2, cell3, cell4]);
  }
}

/**----------------------
 * @param {object} cell1 
 * @param {object} cell2 
 * @param {object} cell3 
 * @param {object} cell4 
 * @param {string} colour 
 * @returns {boolean} 
 --------------------------*/
function checkCellColour(cell1, cell2, cell3, cell4, colour) {
  if (
    cell1.classList.contains(colour) &&
    cell2.classList.contains(colour) &&
    cell3.classList.contains(colour) &&
    cell4.classList.contains(colour)
  ) {
    return true;
  }
}

/**-----------------------
 * @param {string} result
 * @param {string} player 
 * @param {number} point 
 * @param {array} cells 
 ----------------------*/

function displayResult(result, player = null, point = null, cells = null) {
  const overlay = document.createElement('aside');
  let message;

  if (result === 'draw') {
    message = `<h2 class="alert-text">It's a draw!</h2>`;
  }
  if (result === 'winner') {
    message = `
      <h2 class="alert-text">${player} ${player === 'You' ? 'win!' : 'wins!'}</h2>
      <p class="alert-text">${point} points</p>
    `;
    cells.forEach(cell => cell.innerText = '★');
  }

  overlay.className = 'overlay';
  overlay.innerHTML = `
    <div class="alert-container result">
      ${message}
      <button class="btn btn-primary" id="playAgainBtn">play again</button>
    </div>
  `;
  gameSection.appendChild(overlay);
  boardEl.style.marginTop = '4rem';
  playWinSound();

  elById('playAgainBtn').addEventListener('click', runGame);
}

function updatePlayer() {
  player1Turn = player1Turn ? false : true;
  updateName(player1Turn ? playerData.player1Name : playerData.player2Name);
  updateColour(player1Turn ? playerData.player1Colour : playerData.player2Colour);
  computerTurn = false;

  if ((playerData.player1Type === 'computer' && player1Turn) || (playerData.player2Type === 'computer' && !player1Turn)) {
    computerMove();
  }
}

/**-------------
 * @param {string} currentPlayerName
 ------------------*/
function updateName(currentPlayerName) {
  const currentPlayerEl = elById('currentPlayer');
  let text;

  if (currentPlayerName === 'You') {
    text = 'Your';
  } else {
    text = `${currentPlayerName}'s`;
  }

  currentPlayerEl.innerText = text;
}

/**----------------
 * @param {string} currentPlayerColour
 --------------------*/
function updateColour(currentPlayerColour) {
  const topCells = qsa('.cell');
  for (let i = 0; i < NUM_OF_COLUMN; i++) {
    topCells[i].classList.remove('yellow');
    topCells[i].classList.remove('red');
    topCells[i].classList.add(currentPlayerColour);
  }
}

async function playDropSound() {
  if (isMuted) return;
  soundEffect.src = 'assets/sounds/drop.mp3';
  try {
    await soundEffect.play();
  } catch (e) {
    return;
  }
}

function playWinSound() {
  if (isMuted) return;
  soundEffect.src = 'assets/sounds/end.mp3';
  soundEffect.play();
}

function soundBtnToggler() {
  const soundBtns = qsa('.volume-btn');
  isMuted = isMuted ? false : true;

  for (let btn of soundBtns) {
    btn.classList.toggle('active');
  }

  return isMuted;
}

function createGrid() {
  boardEl.innerHTML = '';
  boardEl.style.marginTop = 'unset';

  for (let i = 0; i < NUM_OF_ROW + 1; i++) {
    for (let j = 0; j < NUM_OF_COLUMN; j++) {
      const cell = document.createElement('div');
      cell.className = 'cell';

      if (i === 0) {
        cell.className += ' invisible';
      } else {
        cell.dataset.coordsCol = j;
      }
      boardEl.appendChild(cell);
    }
  }
}

/**----------------
 * @param {string} type 
 --------------------*/
function invalidChangeHandler(type) {
  if (type === 'player1Computer') {
    player2TypeCheckbox.checked = true;
    return;
  }
  if (type === 'player1Yellow') {
    player2ColourCheckbox.checked = true;
    return;
  }
  if (type === 'player1Red') {
    player2ColourCheckbox.checked = false;
    return;
  }
  if (type === 'player2Computer') {
    player1TypeCheckbox.checked = true;
    return;
  }
  if (type === 'player2Yellow') {
    player1ColourCheckbox.checked = true;
    return;
  }
  if (type === 'player2Red') {
    player1ColourCheckbox.checked = false;
    return;
  }
}

/**------------
 * @returns {function} 
 ---------------------*/
function validatePlayerName() {
  let player1Name = elById('player1Name').value.trim();
  let player2Name = elById('player2Name').value.trim();

  if (player1Name && player2Name && player1Name.toUpperCase() === player2Name.toUpperCase()) {
    return showAlert('newGame');
  } else {
    return setPlayerName();
  }
}

function setPlayerName() {
  let player1Type = player1TypeCheckbox.checked ? 'human' : 'computer';
  let player1Colour = player1ColourCheckbox.checked ? 'red' : 'yellow';
  let player1Name = elById('player1Name').value.trim();
  let player2Type = player2TypeCheckbox.checked ? 'human' : 'computer';
  let player2Colour = player2ColourCheckbox.checked ? 'red' : 'yellow';
  let player2Name = elById('player2Name').value.trim();

  if (player1Type === 'computer' && player2Type === 'human') {
    player1Name = player1Name === '' ? 'Computer' : player1Name;
    player2Name = player2Name === '' ? 'You' : player2Name;
  }
  if (player1Type === 'human' && player2Type === 'computer') {
    player1Name = player1Name === '' ? 'You' : player1Name;
    player2Name = player2Name === '' ? 'Computer' : player2Name;
  }
  if (player1Type === 'human' && player2Type === 'human') {
    player1Name = player1Name === '' ? player1Colour : player1Name;
    player2Name = player2Name === '' ? player2Colour : player2Name;
  }

  elById('player1Name').value = '';
  elById('player2Name').value = '';
  configureGame(player1Type, player1Colour, player1Name, player2Type, player2Colour, player2Name);
}

function configureGame(player1Type, player1Colour, player1Name, player2Type, player2Colour, player2Name) {
  playerData = {
    player1Type,
    player1Colour,
    player1Name,
    player2Type,
    player2Colour,
    player2Name
  };
  gamePlayed = 0;
  renderPage('game');
  runGame();
}

function showAlert(pageName) {
  const overlay = document.createElement('aside');
  let message;
  let btn;
  if (pageName === 'newGame') {
    message = `<p class="alert-text">Please make sure each player's name is unique.</p>`;
    btn = `<button class="btn alert-btn" id="nameAlertCloseBtn">ok</button>`;
  }
  if (pageName === 'leaderboard') {
    message = `
      <p class="alert-text">Are you sure you want to delete your save data?</p>
      <p class="alert-text">It cannot be restored once it's deleted.</p>
    `;
    btn = `
      <ul class="btns">
        <li><button class="btn btn-primary alert-btn" id="deleteScoreBtn">ok</button></li>
        <li><button class="btn alert-btn" id="cancelDeleteBtn">cancel</button></li>
      </ul>
    `;
  }

  overlay.className = 'overlay';
  overlay.innerHTML = `
    <div class="alert-container">
      ${message}
      ${btn}
    </div>
  `;

  if (pageName === 'newGame') {
    if (settingsSection.lastChild.className === 'overlay') {
      settingsSection.lastChild.remove();
    }
    settingsSection.appendChild(overlay);
  }
  if (pageName === 'leaderboard') {
    if (leaderboardSection.lastChild.className === 'overlay') {
      leaderboardSection.lastChild.remove();
    }
    leaderboardSection.appendChild(overlay);
  }
  closeAlert(pageName);
}

function closeAlert(pageName) {
  if (pageName === 'newGame') {
    const nameAlertCloseBtn = elById('nameAlertCloseBtn');
    nameAlertCloseBtn.addEventListener('click', (e) => {
      e.target.parentNode.parentNode.remove();
    });
  }
  if (pageName === 'leaderboard') {
    const deleteScoreBtn = elById('deleteScoreBtn');
    const cancelDeleteBtn = elById('cancelDeleteBtn');

    deleteScoreBtn.addEventListener('click', (e) => {
      deleteData();
      e.target.parentNode.parentNode.parentNode.parentNode.remove();
    });
    cancelDeleteBtn.addEventListener('click', (e) => {
      e.target.parentNode.parentNode.parentNode.parentNode.remove();
    });
  }
}

function toggleNav() {
  const nav = elById('nav');
  const toggleBtns = qsa('.nav-toggle-btn');
  const navBtns = qsa('.nav-btn');

  nav.classList.toggle('active');

  for (let btn of toggleBtns) {
    btn.classList.toggle('active');
  }
  for (let navBtn of navBtns) {
    navBtn.classList.toggle('visible');
  }
}

function closeNav() {
  const navOpened = navCloseBtn.classList.contains('active');
  if (navOpened) {
    toggleNav();
  }
}

/**-----------------
 * @param {string} name 
 --------------------*/
function renderPage(name) {
  const targetSection = elById(`${name}`);
  const nav = elById('nav');
  const toggleBtns = qsa('.nav-toggle-btn');
  const navBtns = qsa('.nav-btn');
  const mainHeading = elById('mainHeading');
  const settingHeading = elById('settingHeading');
  const sectionInNav = elById(`primary${name.charAt(0).toUpperCase()}${name.slice(1)}`);

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

  mainHeading.style.display = 'none';
  settingHeading.style.display = 'block';

  for (let section of sections) {
    section.classList.remove('active');
  }

  targetSection.classList.add('active');
  nav.classList.remove('active');

  for (let navBtn of navBtns) {
    navBtn.classList.remove('visible');
    navBtn.classList.remove('active');
  }

  toggleBtns[0].classList.add('active');
  toggleBtns[1].classList.remove('active');

  if (name === 'settings' || name === 'game' || name === 'help' || name === 'leaderboard') {
    sectionInNav.classList.add('active');
  }

  if (name === 'game') {
    const gameSectionHeader = elById('gameHeader');
    const noGameText = elById('noGameText');

   
    if (playerData === undefined) {
      gameSectionHeader.style.display = 'none';
      boardEl.style.display = 'none';
      noGameText.style.display = 'block';
      playToNewGameBtn.style.display = 'flex';
    } else {
      gameSectionHeader.style.display = 'grid';
      boardEl.style.display = 'grid';
      noGameText.style.display = 'none';
      playToNewGameBtn.style.display = 'none';
    }
  }
}

/**--------------
 * @param {string} name 
 * @param {number} point 
 * @param {number} win 
 -------------------*/
function addToLocalstorage(name, point, win) {
  let opponentName = name === playerData.player1Name ? playerData.player2Name : playerData.player1Name;
  const scores = JSON.parse(localStorage.getItem('scores'));
  const nesScoresArray = [];
  const player = {
    name,
    point,
    win,
    games: 1
  };
  const opponent = {
    name: opponentName,
    point: 0,
    win: 0,
    games: 1
  };

  if (scores) {
    scores.push(player);
    scores.push(opponent);
    localStorage.setItem('scores', JSON.stringify(scores));
  } else {
    nesScoresArray.push(player);
    nesScoresArray.push(opponent);
    localStorage.setItem('scores', JSON.stringify(nesScoresArray));
  }
}

function getFromLocalstorage() {
  const data = JSON.parse(localStorage.getItem('scores'));

  if (!data) {
    return displayNoDataText();
  }

  const mergedData = data.reduce((newArray, item) => {
    const duplicateName = newArray.find(obj => obj.name === item.name);
    if (duplicateName) {
      duplicateName.point += item.point;
      duplicateName.win += item.win;
      duplicateName.games += item.games;
    } else {
      newArray.push(item);
    }
    return newArray;
  }, []);

  displayLeaderboardScore(mergedData);
}

function displayNoDataText() {
  const noDataText = elById('noDataText');
  const table = elById('leaderboardTable');

  noDataText.style.display = 'block';
  table.style.opacity = '0';
  leaderboardDeleteBtn.style.display = 'none';
}

/**---------------
 * @param {array} data
 -------------------*/
function displayLeaderboardScore(data) {
  const noDataText = elById('noDataText');
  const table = elById('leaderboardTable');
  const tbody = elById('leaderboardTableBody');

  table.style.opacity = '1';
  tbody.innerHTML = '';
  leaderboardDeleteBtn.style.display = 'flex';
  noDataText.style.display = 'none';

  data.sort((a, b) => {
    return b.point - a.point;
  });

  if (data.length > 5) {
    for (let i = 0; i < 5; i++) {
      tbody.innerHTML += `
        <tr>
          <td class="leaderboard-table-name">${data[i].name}</td>
          <td>${data[i].point}</td>
          <td>${data[i].win}</td>
          <td>${parseFloat((+data[i].win / +data[i].games) * 100).toFixed(2)}%</td>
        </tr>
      `;
    }
  } else {
    data.forEach(item => {
      tbody.innerHTML += `
        <tr>
          <td class="leaderboard-table-name">${item.name}</td>
          <td>${item.point}</td>
          <td>${item.win}</td>
          <td>${parseFloat((+item.win / +item.games) * 100).toFixed(2)}%</td>
        </tr>
      `;
    });
  }
}

function deleteData() {
  const table = elById('leaderboardTable');
  const tbody = elById('leaderboardTableBody');
  const noDataText = elById('noDataText');

  localStorage.clear();
  table.style.opacity = '0';
  tbody.innerHTML = '';
  leaderboardDeleteBtn.style.display = 'none';
  noDataText.style.display = 'block';
}


function init() {
  // Button Click Event listeners
  logoLink.addEventListener('click', () => {
    renderPage('settings');
  });
  navOpenBtn.addEventListener('click', toggleNav);
  navCloseBtn.addEventListener('click', toggleNav);
  navNewGameBtn.addEventListener('click', () => {
    renderPage('settings');
  });
  navGameBtn.addEventListener('click', () => {
    renderPage('game');
  });
  navHelpBtn.addEventListener('click', () => {
    renderPage('help');
  });
  navLeaderboardBtn.addEventListener('click', () => {
    getFromLocalstorage();
    renderPage('leaderboard');
  });
  settingStartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    validatePlayerName();
  });
  settingCloseBtn.addEventListener('click', (e) => {
    e.preventDefault();
    renderPage('game');
  });
  playToNewGameBtn.addEventListener('click', () => {
    renderPage('settings');
  });
  soundBtn.addEventListener('click', soundBtnToggler);
  muteBtn.addEventListener('click', soundBtnToggler);
  landscapeOkBtn.addEventListener('click', (e) => {
    e.target.parentNode.parentNode.remove();
  });
  leaderboardDeleteBtn.addEventListener('click', () => {
    showAlert('leaderboard');
  });
  successHomeBtn.addEventListener('click', () => {
    renderPage('settings');
  });
  failContactBtn.addEventListener('click', () => {
    renderPage('contact');
  });
  footerContactBtn.addEventListener('click', () => {
    renderPage('contact');
  });

  // New Game page checkboxes change Event listener
  player1TypeCheckbox.addEventListener('change', () => {
    if (!player1TypeCheckbox.checked && !player2TypeCheckbox.checked) {
      invalidChangeHandler('player1Computer');
    }
  });
  player1ColourCheckbox.addEventListener('change', () => {
    if (!player1ColourCheckbox.checked && !player2ColourCheckbox.checked) {
      invalidChangeHandler('player1Yellow');
    }
    if (player1ColourCheckbox.checked && player2ColourCheckbox.checked) {
      invalidChangeHandler('player1Red');
    }
  });
  player2TypeCheckbox.addEventListener('change', () => {
    if (!player1TypeCheckbox.checked && !player2TypeCheckbox.checked) {
      invalidChangeHandler('player2Computer');
    }
  });
  player2ColourCheckbox.addEventListener('change', () => {
    if (!player2ColourCheckbox.checked && !player1ColourCheckbox.checked) {
      invalidChangeHandler('player2Yellow');
    }
    if (player2ColourCheckbox.checked && player1ColourCheckbox.checked) {
      invalidChangeHandler('player2Red');
    }
  });


  // Keyboard controls in the game
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' && gameSection.classList.contains('active')) {
      e.preventDefault();
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      return keydownHandler(e.key);
    }
  });

  elById('mainEl').addEventListener('click', closeNav);
}

/**-----------
 * @param {string} id 
 * @returns 
-----------*/
function elById(id) {
  return document.getElementById(id);
}

/**-----------
  * @param {string} selector 
 * @returns {array} 
 ----------------*/
function qsa(selector) {
  return [...document.querySelectorAll(selector)];
}

document.addEventListener('DOMContentLoaded', init);