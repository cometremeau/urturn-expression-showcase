UT.Expression.ready(function (post) {
  'use strict';
  var that = {};
  that.ui = {};
  that.data = {
    trackData: {}
  };
  that.methods = {};

  /**
   * settings
   */
  that.settings = {
    imageRatio: 0.76,
    initialVolume: 1
  };

  /**
   * prepare referance to UI elements
   */
  that.ui.container = $(".container");
  that.ui.playerWrapper = $(".player-wrapper");
  that.ui.playerContainer = $("#player");

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
    i18n: {
      add: "Type here to load your tape",
      change: "",
      error: "Error occurred"
    }
  });

  that.ui.playerContainer.on('utAudio:ready', function (e, data) {
    that.data.trackData = data;
  });

  that.ui.playerContainer.on('utAudio:canplay', function (e, data) {
    that.data.trackData = data;
    that.methods.createPlayer();
    that.methods.checkValidContent();
  });

  that.ui.playerContainer.on('utAudio:timeupdate', function (e, s) {
    var percent = 100 * (s / ((that.data.trackData ? that.data.trackData.duration : 0) / 1000));

    var offset = percent / 100 * 42;

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
  });

  that.ui.playerContainer.on('utAudio:pause', function (e, data) {
    that.methods.setTapeRotation(false);
    that.ui.tapeContainer.removeClass('animate');
    that.methods.setStartRotate();
  });

  that.ui.playerContainer.on('utAudio:change', function () {
    that.methods.checkValidContent();
  });

  that.methods.createPlayer = function () {

    that.methods.createVolumeControl();

    that.ui.tapeWrapper = $("<div class='tape-common-wrapper'></div>").appendTo(that.ui.playerContainer.find('.ut-audio-ui'));
    that.ui.tapeContainer = $("<div class='tape-container'></div>").appendTo(that.ui.tapeWrapper);

    that.ui.bdRadiuxFix = $("<div class='border-radius-fix'></div>").appendTo(that.ui.tapeContainer);

    that.ui.tapeFilmWrapperLeft = $("<div class='tape-film-wrapper tape-film-wrapper-left'></div>").appendTo(that.ui.bdRadiuxFix);
    that.ui.tapeFilmWrapperRight = $("<div class='tape-film-wrapper tape-film-wrapper-right'></div>").appendTo(that.ui.bdRadiuxFix);
    that.ui.tapeFilmLeft = $("<div class='tape-film tape-film-left'></div>").appendTo(that.ui.tapeFilmWrapperLeft);
    that.ui.tapeFilmRight = $("<div class='tape-film tape-film-right'></div>").appendTo(that.ui.tapeFilmWrapperRight);

    that.ui.tapeBgLeft = $("<div class='tape-bg tape-bg-left'></div>").appendTo(that.ui.bdRadiuxFix);
    that.ui.tapeBgRight = $("<div class='tape-bg tape-bg-right'></div>").appendTo(that.ui.bdRadiuxFix);
  };

  that.methods.createVolumeControl = function () {
    that.ui.volumeControl = $("<div class='volume-control'></div>").appendTo(that.ui.playerWrapper);

    that.ui.volumeControl.knobKnob({
      snap: 10,
      value: 359 * that.settings.initialVolume,
      turn: function (ratio) {
        that.ui.playerContainer.utAudio('volume', ratio);
      }
    });
  };

  that.methods.createVolumeControl();

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
    var startDeg = that.methods.getRotationDegrees(that.ui.tapeBgLeft.get(0)),
      deg = startDeg;

    if (bool) {
      if (!that.tapeInterval) {
        that.tapeInterval = setInterval(function () {
          deg -= 45;
          that.ui.tapeContainer.find('.tape-film-left, .tape-bg-left, .tape-film-right, .tape-bg-right').css({
            '-webkit-transform': 'rotate(' + deg + 'deg)',
            '-moz-transform': 'rotate(' + deg + 'deg)',
            'ms-transform': 'rotate(' + deg + 'deg)',
            'transform': 'rotate(' + deg + 'deg)'
          });
        }, 200);
      }
    } else {
      clearInterval(that.tapeInterval);
      that.tapeInterval = false;
    }
  };

  that.methods.setStartRotate = function () {
    var deg = that.methods.getRotationDegrees(that.ui.tapeBgLeft.get(0));

    that.ui.tapeContainer.find('.tape-film-left, .tape-bg-left, .tape-film-right, .tape-bg-right').css({
      '-webkit-transform': 'rotate(' + deg + 'deg)',
      '-moz-transform': 'rotate(' + deg + 'deg)',
      'ms-transform': 'rotate(' + deg + 'deg)',
      'transform': 'rotate(' + deg + 'deg)'
    });
  };

  that.methods.adaptSize = function (width, height) {
    var newW, newH;
    if (width > height || width / that.settings.imageRatio > height) {
      newH = height;
      newW = height * that.settings.imageRatio;
    } else {
      newW = width;
      newH = width / that.settings.imageRatio;
    }
    that.ui.playerWrapper.css({
      height: newH,
      width: newW,
      marginTop: -newH / 2,
      marginLeft: -newW / 2,
      fontSize: newH / 350 + 'em'
    });
  };

  that.methods.adaptSize(that.ui.container.width(), that.ui.container.height());

  that.methods.checkValidContent = function () {
    var res = (!$.isEmptyObject(that.data.trackData));
    try {
      post.valid(res);
    } catch (e) {
    }
  };

  post.on('resize', function () {
    that.methods.adaptSize(that.ui.container.width(), that.ui.container.height());
  });

  return that;
});
