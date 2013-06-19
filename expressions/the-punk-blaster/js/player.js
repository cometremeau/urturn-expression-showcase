//preload images
var tmp = new Image();
tmp.src = 'images/fwd-pressed.png';
tmp.src = 'images/rwd-pressed.png';

UT.Expression.ready(function (post) {
  'use strict';
  var that = {};
  that.ui = {};
  that.data = {};
  that.methods = {};

  /**
   * settings
   */
  that.settings = {
    isTouch: 'ontouchstart' in window || window.navigator.msMaxTouchPoints > 0,
    imageRatio: 0.76,
    initialVolume: 1,
    currentTime: 0,
    seekInterval: false,
    tapeInterval: false,
    rotateAngle: 45,
    tapeLSpeedOffset: 1,
    tapeRSpeedOffset: 1,
    rearward: false
  };

  /**
   * prepare referance to UI elements
   */
  that.ui.container = $(".container");
  that.ui.playerWrapper = $(".player-wrapper");
  that.ui.playerContainer = $("#player");

  if (that.settings.isTouch) {
    that.ui.container.addClass('is-touch');
  }

  var calcContHeight = that.ui.container.width() / that.settings.imageRatio;

  that.ui.playerContainer.css({
    'font-size': calcContHeight / 350 + 'em'
  });

  that.ui.playerContainer.utAudio({
    skin: 'cassette',
    ui: {
      play: true,
      title: true,
      artwork: true,
      progress: false,
      source: false,
      time: false
    },
    editable: false
  });

  that.valumeControl = $("<div class='volume-control'></div>").appendTo(that.ui.playerContainer);

  that.ui.playerContainer.on('utAudio:ready', function (e, data) {
    that.data.trackData = data;
  });

  that.ui.playerContainer.on('utAudio:canplay', function (e, data) {
    that.data.trackData = data;
    that.methods.createPlayer();
  });

  that.ui.playerContainer.on('utAudio:timeupdate', function (e, s) {
    var percent = 100 * (s / ((that.data.trackData ? that.data.trackData.duration : 0) / 1000));

    var offset = percent / 100 * 42;

    that.settings.tapeLSpeedOffset = 1 + (0.1 * percent / 100);
    that.settings.tapeRSpeedOffset = 1.1 - (0.1 * percent / 100);

    //100 - max tape width in %, 58 - min, 42 - difference
    that.ui.tapeFilmLeft.css({
      'width': 100 - offset + '%',
      'height': 100 - offset + '%'
    });
    that.ui.tapeFilmRight.css({
      'width': 58 + offset + '%',
      'height': 58 + offset + '%'
    });
  });

  that.ui.playerContainer.on('utAudio:play', function (e, data) {
    that.ui.tapeContainer.addClass('animate');
    that.methods.setTapeRotation(true);
    that.ui.noisePlayer.play();
  });

  that.ui.playerContainer.on('utAudio:pause', function (e, data) {
    that.methods.setTapeRotation(false);
    that.ui.tapeContainer.removeClass('animate');
    that.methods.setStartRotate();
    that.ui.noisePlayer.pause();
  });

  that.ui.playerContainer.on('utAudio:finish', function () {
    clearInterval(that.settings.seekInterval);
    that.settings.rotateAngle = 45;
    that.ui.noisePlayer.pause();
  });

  that.ui.noisePlayer = document.getElementById('noise-player');

  that.ui.rwd = $("<div class='rwd'></div>").appendTo(that.ui.playerWrapper).on(that.settings.isTouch ? 'touchstart' : 'mousedown', function(){
    $(this).addClass('active');
    that.settings.rearward = true;
    that.settings.rotateAngle = 90;
    that.settings.seekInterval = setInterval(function(){
      if (that.settings.currentTime > 0) {
        that.settings.currentTime -= 1;
        that.ui.playerContainer.utAudio('play', that.settings.currentTime);
      } else {
        clearInterval(that.settings.seekInterval);
        that.settings.rotateAngle = 45;
        that.settings.rearward = false;
      }
    }, 100);
  }).on(that.settings.isTouch ? 'touchend' : 'mouseup', function(){
      clearInterval(that.settings.seekInterval);
      that.settings.rotateAngle = 45;
      that.settings.rearward = false;
      $(this).removeClass('active');
    });
  that.ui.fwd = $("<div class='fwd'></div>").appendTo(that.ui.playerWrapper).on(that.settings.isTouch ? 'touchstart' : 'mousedown', function(){
    $(this).addClass('active');
    that.settings.rotateAngle = 90;
    that.settings.seekInterval = setInterval(function(){
      that.settings.currentTime += 1;
      that.ui.playerContainer.utAudio('play', that.settings.currentTime);
    }, 100);
  }).on(that.settings.isTouch ? 'touchend' : 'mouseup', function(){
      clearInterval(that.settings.seekInterval);
      that.settings.rotateAngle = 45;
      $(this).removeClass('active');
    });

  that.ui.volumeControl = $("<div class='volume-control'></div>").appendTo(that.ui.playerWrapper);

  that.ui.volumeControl.knobKnob({
    snap: 10,
    value: 359 * that.settings.initialVolume,
    turn: function (ratio) {
      that.ui.playerContainer.utAudio('volume', ratio);
    }
  });

  that.methods.createPlayer = function () {
    that.ui.tapeWrapper = $("<div class='tape-common-wrapper'></div>").appendTo(that.ui.playerContainer.find('.ut-audio-ui'));
    that.ui.tapeContainer = $("<div class='tape-container'></div>").appendTo(that.ui.tapeWrapper);

    that.ui.bdRadiuxFix = $("<div class='border-radius-fix'></div>").appendTo(that.ui.tapeContainer);

    that.ui.tapeFilmWrapperLeft = $("<div class='tape-film-wrapper tape-film-wrapper-left'></div>").appendTo(that.ui.bdRadiuxFix);
    that.ui.tapeFilmWrapperRight = $("<div class='tape-film-wrapper tape-film-wrapper-right'></div>").appendTo(that.ui.bdRadiuxFix);
    that.ui.tapeFilmLeft = $("<div class='tape-film tape-film-left'></div>").appendTo(that.ui.tapeFilmWrapperLeft);
    that.ui.tapeFilmRight = $("<div class='tape-film tape-film-right'></div>").appendTo(that.ui.tapeFilmWrapperRight);

    that.ui.tapeBgLeft = $("<div class='tape-bg tape-bg-left'></div>").appendTo(that.ui.bdRadiuxFix);
    that.ui.tapeBgRight = $("<div class='tape-bg tape-bg-right'></div>").appendTo(that.ui.bdRadiuxFix);

    that.ui.numbers = $("<div class='numbers'></div>").appendTo(that.ui.tapeWrapper);
  };

  that.methods.getRotationDegrees = function (element) {
    // get the computed style object for the element
    var style = window.getComputedStyle(element);
    // this string will be in the form 'matrix(a, b, c, d, tx, ty)'
    var transformString = style['-webkit-transform'] || style['-moz-transform'] || style['transform'];
    if (!transformString || transformString === 'none') {
      return 0;
    }
    var splits = transformString.split(',');
    // parse the string to get a and b
    var a = parseFloat(splits[0].substr(7));
    var b = parseFloat(splits[1]);
    // doing atan2 on b, a will give you the angle in radians
    var rad = Math.atan2(b, a);
    var deg = 180 * rad / Math.PI;
    // instead of having values from -180 to 180, get 0 to 360
    if (deg < 0) {
      deg += 360;
    }
    return deg;
  };

  that.methods.setTapeRotation = function (bool) {
    var startDegL = that.methods.getRotationDegrees(that.ui.tapeBgLeft.get(0)),
      degL = startDegL,
      startDegR = that.methods.getRotationDegrees(that.ui.tapeBgRight.get(0)),
      degR = startDegR;

    if (bool) {
      if (!that.settings.tapeInterval) {
        that.settings.tapeInterval = setInterval(function () {
          if (that.settings.rearward) {
            degL = degL + that.settings.rotateAngle * that.settings.tapeLSpeedOffset;
            degR = degR + that.settings.rotateAngle * that.settings.tapeRSpeedOffset;
          } else {
            degL = degL - that.settings.rotateAngle * that.settings.tapeLSpeedOffset;
            degR = degR - that.settings.rotateAngle * that.settings.tapeRSpeedOffset;
          }
          that.methods.setTransform(degL, degR);
        }, 200);
      }
    } else {
      clearInterval(that.settings.tapeInterval);
      that.settings.tapeInterval = false;
    }
  };

  that.methods.setStartRotate = function () {
    var startDegL = that.methods.getRotationDegrees(that.ui.tapeBgLeft.get(0)),
      startDegR = that.methods.getRotationDegrees(that.ui.tapeBgRight.get(0));

    that.methods.setTransform(startDegL, startDegR);
  };

  that.methods.setTransform = function(degL, degR) {
    that.ui.tapeContainer.find('.tape-film-left, .tape-bg-left').css({
      '-webkit-transform': 'rotate(' + degL + 'deg)',
      '-moz-transform': 'rotate(' + degL + 'deg)',
      'ms-transform': 'rotate(' + degL + 'deg)',
      'transform': 'rotate(' + degL + 'deg)'
    });
    that.ui.tapeContainer.find('.tape-film-right, .tape-bg-right').css({
      '-webkit-transform': 'rotate(' + degR + 'deg)',
      '-moz-transform': 'rotate(' + degR + 'deg)',
      'ms-transform': 'rotate(' + degR + 'deg)',
      'transform': 'rotate(' + degR + 'deg)'
    });
  };

  post.resize({'height': that.ui.container.width() / that.settings.imageRatio});

  return that;
});