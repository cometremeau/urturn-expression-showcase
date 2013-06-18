/**
 * Puzzle Player controller
 */

var canvas = null;
var ctx = null;
var WIDTH = 640;
var HEIGHT = 640;
var MAP = [];
var TARGET_COLOR = null;
var NEW_COLOR = null;
var SCORE = 0;
var HIGH_SCORES = null;
var OTHERS_HIGHSCORES = null;
var userHighScore = 0;
var GAME_OVER = 0;
var post = null;
var USERNAME = '';
var AVATAR = '';
var PARTICLES = [];
var PAINT = null;

// Bootstrap you expression editor
UT.Expression.ready(function(postInstance){
  post = postInstance;
  post.resize(post.node.offsetWidth + 55);
  MAP = JSON.parse(post.storage.map);
  HIGH_SCORES = post.collection('scores');
  userHighScore = HIGH_SCORES.getUserItem();
  HIGH_SCORES.find(otherScoresCallback);
  document.getElementById('thumb').src = post.storage.thumb;
  document.getElementById('authorProfile').innerHTML = '' + post.storage.creator;

  if (userHighScore) {
    renderHighScores();
  }
  renderGame();
  post.users('current', function(user){
    if (!user) {
      return;
    }
    USERNAME = user.username;
    AVATAR = user.avatar();
  })
});

function init() {
  canvas = document.getElementById('theCanvas');
  canvas.addEventListener('mousedown', mouseDown);
  canvas.addEventListener('mouseup', mouseUp);
  canvas.addEventListener('touchstart', touchstart);
  canvas.addEventListener('touchend', touchend);
  ctx = canvas.getContext('2d');
  PAINT = document.createElement('image');
  PAINT.src = 'assets/paint.png';
}

function play() {
  GAME_OVER = 0;
  SCORE = 0;
  MAP = JSON.parse(post.storage.map);
  renderGame();
  document.getElementById('hs').style.display = 'none';
  document.getElementById('highscores').style.display = 'none';
  document.getElementById('creatorBox').style.display = 'none';
  document.getElementById('youJustDid').style.display = 'none';
  document.getElementById('scores').style.display = 'block';
}

function restart() {
    play();
}

function goProfile(el) {
  var value = el.innerHTML;
  post.navigate('user', value);
}

function otherScoresCallback(items) {
  OTHERS_HIGHSCORES = items;
  OTHERS_HIGHSCORES.sort(function (a, b) {
    if (a.score < b.score) {
      return -1;
    }
    return 1;
  });
  computeUserPosition();
  renderOtherHighScore();
}

function goExpPage() {
  post.navigate('browse', 'http://urturn.com/pld/puzzle');
}

function createScoreLine(className, position, username, score, linked, others) {
  var tr = document.createElement('tr');
  if (username.length > 12) {
    username = username.substring(0, 9) + '...';
  }
  tr.className = className;
  tr.innerHTML = '<td>' 
          + position 
          +  '</td><td>'
          + username
          +  '</td><td>'
          +  score
          +  '</td>';
  others.appendChild(tr);
}

function renderOtherHighScore() {
  if (!OTHERS_HIGHSCORES) {
   return;
  }
  var others = document.getElementById('others');
  others.innerHTML = '';
  if (USER_POSITION < 6) {
    if (OTHERS_HIGHSCORES) {
      var i = 0;
      while (i < 6) {
        var className = '';
        if (i % 2 == 1) {
          className = 'scoreOdd';
        }
        if (i == USER_POSITION) {
          className = 'scoreCurrent';
        }
        
        if (i < OTHERS_HIGHSCORES.length) {
          createScoreLine(className, 
              i + 1, 
              '@' + OTHERS_HIGHSCORES[i].username, 
              OTHERS_HIGHSCORES[i].score,
              true,
              others
          );
        }
        else {
         createScoreLine(className, 
              i + 1, 
              'No Entry', 
              '??',
              true,
              others
          );
        }
        ++i;
      }
    }
  }
  else {
    if (OTHERS_HIGHSCORES) {
      var i = 0;
      while (i < 4) {
        var className = '';
        if (i % 2 == 1) {
          className = 'scoreOdd';
        }
        
        if (i < OTHERS_HIGHSCORES.length) {
          createScoreLine(className, 
              i + 1, 
              '@' + OTHERS_HIGHSCORES[i].username, 
              OTHERS_HIGHSCORES[i].score,
              true,
              others
          );
        }
        else {
         createScoreLine(className, 
              i + 1, 
              'No Entry', 
              '??',
              true,
              others
          );
        }
        ++i;
      }
      createScoreLine('scoreOdd', 
            '...', 
            '...', 
            '...',
            true,
            others
        );
      createScoreLine('scoreCurrent', 
            USER_POSITION + 1, 
            '@' + OTHERS_HIGHSCORES[USER_POSITION].username, 
            OTHERS_HIGHSCORES[USER_POSITION].score,
            true,
            others
        );
    }
  }   
}

function drawHighScores() {
  if (USER_POSITION == -1) {
    computeUserPosition();
  }
  if (SCORE) {
    document.getElementById('youJustDid').style.display = 'block';
    document.getElementById('yourScore').innerHTML = SCORE;
  }
  var hs = document.getElementById('hs');
  hs.style.display = 'block';
  document.getElementById('scores').style.display = 'none';
  document.getElementById('highscores').style.display = 'block';
  document.getElementById('creatorBox').style.display = 'block';
  GAME_OVER = 1;
  renderOtherHighScore();
}


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

var MOUSE = {
  x : 0,
  y : 0
}

var SELECTED = {
  x : 0,
  y : 0,
  d : 0
}

function mouseDown(event) {
  if (GAME_OVER) {
    return;
  }
  var x = (event.clientX / (canvas.offsetWidth / WIDTH)) / 80 | 0;
  var y = (event.clientY / (canvas.offsetHeight / HEIGHT)) / 80 | 0;

  if (SELECTED.d) {
    if (Math.abs(MOUSE.x - x) + Math.abs(MOUSE.y  - y) === 1) {
      contaminate(x,y, MOUSE.x, MOUSE.y);
    }
    SELECTED.d = 0;
  }
  else {
    MOUSE.x = x;
    MOUSE.y = y;
    SELECTED.x = x;
    SELECTED.y = y;
    SELECTED.d = 1; 
  }
  // GUI!
  renderGame();
} 

function mouseUp(event) {
  if (GAME_OVER) {
    return;
  }
  if (!SELECTED.d) {
    return;
  }
  var x = (event.clientX / (canvas.offsetWidth / WIDTH)) / 80 | 0;
  var y = (event.clientY / (canvas.offsetHeight / HEIGHT)) / 80 | 0;  
  if (x == SELECTED.x && y == SELECTED.y) {
    return
  }
  SELECTED.d = 0;
  // If move is valid
  if (Math.abs(MOUSE.x - x) + Math.abs(MOUSE.y  - y) === 1) {
    contaminate(x,y, MOUSE.x, MOUSE.y);
  } 
  renderGame();
}

function renderGame() {
  renderMap();
  renderGUI();
}

function renderMap()
{
  var i = 0;
  while (i < 8) {
    var j = 0;
    while (j < 8) {
      ctx.fillStyle = MAP[i][j];
      ctx.fillRect(i * 80, j * 80, 80, 80)
      ++j;
    }
    ++i;
  }
}

function renderGameOver() {
  renderHighScores();
}


var USER_POSITION = -1;
function  computeUserPosition() {
  if (!userHighScore || !OTHERS_HIGHSCORES) {
    return;
  }
  // Reorder high scores
  OTHERS_HIGHSCORES.sort(function (a, b) {
    if (a.score < b.score) {
      return -1;
    }
    return 1;
  });
  // find user in high scores
  var i = 0;
  USER_POSITION = OTHERS_HIGHSCORES.length;
  while (i < OTHERS_HIGHSCORES.length) {
    if (OTHERS_HIGHSCORES[i].score > userHighScore || OTHERS_HIGHSCORES[i].username == USERNAME) {
      USER_POSITION = i;
    }
    ++i;
  }
}

function renderHighScores() {
  if (userHighScore) {
    if (userHighScore.score > SCORE) {
      setHighScore();
      computeUserPosition();
    }
  }
  else {
    setHighScore();
  }
  if (USER_POSITION == -1) {
   computeUserPosition();
  }
  drawHighScores();
}

function setHighScore() {
  if (SCORE == 0)
    return;
  userHighScore = {};
  userHighScore.score = SCORE;
  userHighScore.username = USERNAME;
  userHighScore.avatar = AVATAR;
  HIGH_SCORES.setUserItem(userHighScore);
  var i = 0;
  var userAlreadyHaveScored = 0;
  while (i < OTHERS_HIGHSCORES.length) {
    if (OTHERS_HIGHSCORES[i].username == USERNAME) {
      OTHERS_HIGHSCORES[i].score = SCORE;
      userAlreadyHaveScored = 1;
    }
    ++i;
  }
  if (!userAlreadyHaveScored) {
    OTHERS_HIGHSCORES.push(userHighScore);
    computeUserPosition();
  }
  post.save();
}

function isSuccess(){
  var i = 0;
  var reference = MAP[0][0];
  while (i < 8) {
    var j = 0;
    while (j < 8) {
      if (MAP[i][j] != reference) {
        return false;
      }
      ++j;
    }
    ++i;
  }
  return true;
}

function renderCircle(x, y) {
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.arc(x * 80 + 40, y * 80 + 40, 20, 0, 2 * Math.PI, false);
  ctx.fill();
  ctx.globalAlpha = 0.8;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function renderGUI(){
  if (SELECTED.d) {
    // selected arc
   

    var c = document.createElement('canvas');
    c.width = 80;
    c.height = 80;
    var t = c.getContext('2d');
    t.drawImage(PAINT, 0,0);
    t.globalCompositeOperation = 'xor';
    t.fillStyle = MAP[SELECTED.x][SELECTED.y];
    t.fillRect(0,0,80,80);

    ctx.drawImage(c, (SELECTED.x - 1) * 80, SELECTED.y * 80);
    ctx.drawImage(c, (SELECTED.x + 1) * 80, SELECTED.y * 80);
    ctx.drawImage(c, SELECTED.x* 80, (SELECTED.y - 1) * 80);
    ctx.drawImage(c, SELECTED.x* 80, (SELECTED.y + 1) * 80);
  }
}

function contaminate(targetX, targetY, sourceX, sourceY) {
  TARGET_COLOR = MAP[targetX][targetY];
  NEW_COLOR = MAP[sourceX][sourceY];
  if (TARGET_COLOR != NEW_COLOR) {
    SCORE++;
    document.getElementById('uscore').innerHTML = SCORE;
    recursiveContamination(targetX, targetY);
  }

  if (isSuccess()) {
    renderGameOver();
  }
}


function recursiveContamination(x, y) {

  PARTICLES.push(
    {
      x : x * 80,
      y : y * 80,
      c : MAP[x][y],
      n : NEW_COLOR,
      s : 0
    });

  MAP[x][y] = NEW_COLOR;
  if (x > 0 && MAP[x - 1][y] == TARGET_COLOR) {
    recursiveContamination(x -1, y);
  }
  if (x < 7 && MAP[x + 1][y] == TARGET_COLOR) {
    recursiveContamination(x + 1, y)
  }
  if (y > 0 && MAP[x][y - 1] == TARGET_COLOR) {
    recursiveContamination(x, y - 1);
  }
  if (y < 7 && MAP[x][y + 1] == TARGET_COLOR) {
    recursiveContamination(x, y + 1);
  }
}

// Render loop

window.requestAnimFrame = (function(){
return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function( callback ){
          window.setTimeout(callback, 1000 / 60);
        };
})();

function renderParticles() {
  var i = 0;
  while (i < PARTICLES.length) {
    var p = PARTICLES[i];

    p.s += 5;
   
    if (p.s == 100) {
      ctx.fillStyle = p.n;
      ctx.fillRect(p.x, p.y, 80, 80);
      PARTICLES.splice(i, 1);
      --i;
    }
    else {

      ctx.fillStyle = p.c;
      ctx.fillRect(p.x , p.y, 80, 80);
      ctx.globalAlpha = p.s / 100;
      ctx.fillStyle = p.n;
      ctx.fillRect(p.x , p.y, 80, 80);
      ctx.globalAlpha = 1.0;
    }
    ++i;

  }
}

function help() {
  document.getElementById('tuto').style.display = 'block';
}

function hideHelp() {
    document.getElementById('tuto').style.display = 'none';
}

function loop() {
  if (PARTICLES.length) {
    renderParticles();
  }
  requestAnimFrame(loop);
}

window.onload = function() {
  init();
  loop();
}