/*
* Puzzle Expression Editor controller 
*/

// a post variable to access the sdk :p
var post = null;

// Bootstrap you expression editor
UT.Expression.ready(function(expressionPostInstance){
  // save the current instance of post inside... post.
  post = expressionPostInstance;

  // get current user data and store creator username 
  post.users('current', function(user) {
    post.storage.creator = user.username;
  });
  
  // if a map is already in storage, then user is editing the board
  if (post.storage.map) {
    loadMapFromStorage();
  }

  // Add an hidden key to index all puzzle post under "Puzzle Board"
  // so they can be retrieve latter to direct the user to a page
  // with all boards.
  post.storage.puzzleKey = "PuzzleBoards";
});


// Variables used for the editor.
var canvas = null;
var ctx = null;

// canvas size in pixels
var WIDTH = 640;
var HEIGHT = 720;

// index in COLORS Table of the color currently selected by user
var COLOR_INDEX = 0;

// Table of colors used on the board
var COLORS = [
  '#221e23',
  '#382834',
  '#573847',
  '#66464F',
  '#705351',
  '#8A6D60',
  '#BDA488',
  '#e8d9b7'
];

// A 2 dimentional array representing the board. (8x8)
// Contain color code
var MAP = [];

// A 2 dimentional array representing the board (8x8)
// Contain colors indexes
var SCHEMA_MAP = [];

// This object is used to store current mouse state :
// x => X position on grid
// y => Y position on grid
// down => if mouse is currently down or not
var MOUSE = {
  x : 0,
  y : 0,
  down  :0
}

function init(){
  // load canvas and context
  canvas = document.getElementById('c');
  ctx = canvas.getContext('2d');

  // create a new unique pallette
  generatePalette();
  // init MAP and MAP_SCHEMA
  initBoardRepresentation();
  // Clean the board
  blankBoard();
  // draw the grid
  renderGrid();
  // draw the palette
  renderPalette();

  // attach a couple of events
  canvas.addEventListener('mousedown', mouseDown);
  canvas.addEventListener('mouseup', mouseUp);
  canvas.addEventListener('mousemove', mouseMove);
  canvas.addEventListener('touchstart', touchstart);
  canvas.addEventListener('touchend', touchend);
  canvas.addEventListener('touchmove', touchmove);
  canvas.addEventListener('mouseout', mouseOut);


}

// handle re-edit mode
function loadMapFromStorage() {
  // load already defined map and pallette
  MAP = JSON.parse(post.storage.map);
  COLORS = JSON.parse(post.storage.pallette);
  SCHEMA_MAP = JSON.parse(post.storage.schema);
  // then render it!
  renderMap();
  renderPalette();
}

// everytime we change the map, we should save it
function saveMap() {
  // add data we want to save to storage
  post.storage.pallette = JSON.stringify(COLORS);
  post.storage.map = JSON.stringify(MAP);
  post.storage.schema = JSON.stringify(SCHEMA_MAP);

  // generate a thumb of the current board (to be display on highscore panel)
  var c = document.createElement('canvas');
  c.width = 70;
  c.height = 70;
  var t = c.getContext('2d');
  t.drawImage(canvas, 0,0,640,640,0,0,70,70);
  var thumb = c.toDataURL("image/jpg");
  post.storage.thumb = thumb;

  // save storage
  post.storage.save();
  // validate the post (so user can post the current board)
  post.valid(true);
}

// Called to hide tutorial
function startEditing() {
  document.getElementById('cache').style.display = 'none';
  document.getElementById('tuto').style.display = 'none';
}

// generate a new color pallette
function generatePalette() {
  var START = [];
  var END = [];
  var s = 0;
  var m = 0;
  while (s < 256 || m < 90) {
    START = [Math.random() * 128 | 0, Math.random() * 128 | 0, Math.random() * 128 | 0];
    END = [128 + Math.random() * 128 | 0, 128 + Math.random() * 128 | 0, 128 + Math.random() * 128 | 0];
    s = Math.abs(START[0] - END[0]) + Math.abs(START[1] - END[1]) + Math.abs(START[2] - END[2]) ;
    m = Math.max(Math.abs(START[0] - END[0]) ,Math.abs(START[1] - END[1]) , Math.abs(START[2] - END[2]));
  }
  var dr = (END[0] - START[0]) / 8;
  var dg = (END[1] - START[1]) / 8;
  var db = (END[2] - START[2]) / 8;


  var r = START[0];
  var g = START[1];
  var b = START[2];

  var i = 0;
  while (i < 8) {
    COLORS[i] = "rgb(" + (r | 0) + "," + (g | 0) + ","+ (b | 0) + ")";
    r += dr;
    g += dg;
    b += db;
    ++i;
  }
}


function initBoardRepresentation() {
  var i = 0;
  while (i < 8) {
    MAP[i] = [];
    SCHEMA_MAP[i] = [];
    var j = 0;
    while (j < 8) {
      MAP[i][j] = COLORS[7];
      SCHEMA_MAP[i][j] = 7;
      j++;
    }
    ++i;
  }
}


// draw a gizmo grid in top of the board to help 
// user place it's first blocs
function renderGrid() {
  ctx.fillStyle = COLORS[6];
  var i = 0;
  while (i < 7) {
    ++i;
    ctx.fillRect(i * 80 - 1, 0, 2, 640);
    ctx.fillRect(0, i * 80 - 1, 640, 2);
  }
}

// blank the board
function blankBoard() {
  ctx.fillStyle = COLORS[7];
  ctx.fillRect(0,0,640,640);
  ctx.font = "20px 'Cooper Heavy'";
}

// draw the pallette
function renderPalette() {
  var i =0;
  // draw the 8 color squres
  while (i < 8) {
    ctx.fillStyle = COLORS[i];
    ctx.fillRect((i % 8) * 70, 640, 70, 70);
    ++i;
  }
  // draw reroll button
  ctx.fillStyle = '#fafafa';
  ctx.fillRect(8*70, 640, 80, 100);
  ctx.fillStyle = COLORS[0];
  ctx.fillText('reroll', 578, 685);
  // draw selection square arround currently selected color
  if (COLOR_INDEX < 4) {
    ctx.strokeStyle = COLORS[7];
  }
  else {
    ctx.strokeStyle = COLORS[0];
  }
  ctx.strokeRect((COLOR_INDEX % 8) * 70 + 1, 640 + 1, 68, 68);
}


// draw the map
function renderMap()
{
  blankBoard();
  renderGrid();
  // go through each board (8x8) squares and draw them
  var i = 0;
  while (i < 8) {
    var j = 0;
    while (j < 8) {
      if (MAP[i][j] != COLORS[7]) {
        ctx.fillStyle = MAP[i][j];
        ctx.fillRect(i * 80, j * 80, 80, 80)
      }
      ++j;
    }
    ++i;
  }
}

// Transform touch events to mouse events
function touchstart(event){
  var e = event.touches[0];
  mouseDown(e);
  event.preventDefault();
  event.stopPropagation();
}

function touchend(event){
  var e = event.touches[0];
  mouseUp(e);
  event.preventDefault();
  event.stopPropagation();
}

function touchmove(event){
  var e = event.touches[0];
  mouseMove(e);
  event.preventDefault();
  event.stopPropagation();
}


function mouseOut(event) {
  MOUSE.down = 0;
}

function mouseDown(event) {
  var x = (event.clientX / (canvas.offsetWidth / WIDTH)) / 80 | 0;
  var y = (event.clientY / (canvas.offsetHeight / HEIGHT)) / 80 | 0;

  // click on board
  if (y < 8 ) {
    if (MAP[x][y] != COLORS[COLOR_INDEX]) {
     draw(x, y);
    }
    MOUSE.x = x;
    MOUSE.y = y;
    MOUSE.down  = 1;
  }
  // click on pallette
  else {
    var x = (event.clientX / (canvas.offsetWidth / WIDTH)) / 70 | 0;
    selectColor(x, y);
  }
}

function mouseMove(event) {
  if (!MOUSE.down) {
    return;
  }
  var x = (event.clientX / (canvas.offsetWidth / WIDTH)) / 80 | 0;
  var y = (event.clientY / (canvas.offsetHeight / HEIGHT)) / 80 | 0;

  if (y < 8) {
    if (MAP[x][y] != COLORS[COLOR_INDEX]) {
     draw(x, y);
    }
    MOUSE.x = x;
    MOUSE.y = y;
}
}

function mouseUp(event) {
  MOUSE.down = 0;
}

// change the map to adapt a new color pallette
function remixMap() {
  var i = 0;
  while (i < 8) {
    var j = 0;
    while (j < 8)
    {
      MAP[i][j] = COLORS[SCHEMA_MAP[i][j]];
      ++j;
    }
    ++i;
  }
}

// Called when user select a new color or reroll
function selectColor(x, y) {
  if (x  <8) {
   COLOR_INDEX = x;
   COLOR_INDEX = x;
   renderPalette();
  }
  else {
    generatePalette();
    renderPalette();
    remixMap();
    renderMap();
    saveMap();
  }
}

// draw a square on map at position (x, y)
function draw(x, y) {
  ctx.fillStyle = COLORS[COLOR_INDEX];
  ctx.fillRect(x * 80, y * 80, 80, 80);
  MAP[x][y] = COLORS[COLOR_INDEX];
  SCHEMA_MAP[x][y] = COLOR_INDEX;
  saveMap();
}  

window.onload = function() {
  init();
}