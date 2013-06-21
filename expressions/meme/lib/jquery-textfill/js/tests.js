var JTF = 'jtf';


function setup(opts) {
  var $t = $('#qunit-fixture');
  var $d = $('<div/>', opts.div).appendTo($t);
  var $s = $('<span/>', opts.span).appendTo($d);
}


test('capped at 10px', function () {
  setup({
    div: {
      id: JTF,
      width: 285,
      height: 210
    },
    span: {
      css: {
        'font-family': 'VT323',
      },
      text: 'test'
    }
  });

  var $jtf = $('#' + JTF);
  var $span = $jtf.find('span');
  $jtf.textfill({debug: true, maxFontPixels: 10});
  equal($span.css('font-size'), '10px');
});


test('size up to max', function () {
  setup({
    div: {
      id: JTF,
      width: 285,
      height: 210
    },
    span: {
      css: {
        'font-family': 'VT323',
      },
      text: 'test'
    }
  });

  var $jtf = $('#' + JTF);
  var $span = $jtf.find('span');
  $jtf.textfill({debug: true, maxFontPixels: 0});
  equal($span.css('font-size'), '172px');
});


test('width be maxWidth', function () {
  setup({
    div: {
      id: JTF,
      width: 196,
      height: 210
    },
    span: {
      css: {
        'font-family': 'VT323',
      },
      text: 'test'
    }
  });

  var $jtf = $('#' + JTF);
  var $span = $jtf.find('span');
  $jtf.textfill({debug: true, maxFontPixels: 0});
  equal($span.css('font-size'), '119px');
});


test('height be maxHeight', function () {
  setup({
    div: {
      id: JTF,
      width: 285,
      height: 158
    },
    span: {
      css: {
        'font-family': 'VT323',
      },
      text: 'test'
    }
  });

  var $jtf = $('#' + JTF);
  var $span = $jtf.find('span');
  $jtf.textfill({debug: true, maxFontPixels: 0});
  equal($span.css('font-size'), '158px');
});


test('minFontPixels too big to fit in', function () {
  setup({
    div: {
      id: JTF,
      width: 40,
      height: 40
    },
    span: {
      css: {
        'font-family': 'VT323',
        'font-size': '20px',
      },
      text: 'test'
    }
  });

  var $jtf = $('#' + JTF);
  var $span = $jtf.find('span');
  $jtf.textfill({debug: true, minFontPixels: 100, maxFontPixels: 0});
  equal($span.css('font-size'), '20px');
});


/****************/
/* debug option */
/****************/

module('debug option', {
  setup: function () {
    if (console.debug_original) {
      throw 'console.debug_original already has value.';
    }
    console.debug_original = console.debug;
    console.debug_called = false;
    console.debug = function () {
      console.debug_called = true;
    }
  },
  teardown: function () {
    if (!console.debug_original) {
      throw 'console.debug_original is empty.';
    }
    console.debug = console.debug_original;
    console.debug_original = undefined;
    console.debug_called = undefined;
  }
});


test('debug used', function () {
  setup({
    div: {
      id: JTF,
      width: 285,
      height: 210
    },
    span: {
      css: {
        'font-family': 'VT323',
      },
      text: 'test'
    }
  });

  var $jtf = $('#' + JTF);
  $jtf.textfill({debug: true, maxFontPixels: 10});
  equal(console.debug_called, true);
});


test('debug not used', function () {
  setup({
    div: {
      id: JTF,
      width: 285,
      height: 210
    },
    span: {
      css: {
        'font-family': 'VT323',
      },
      text: 'test'
    }
  });

  var $jtf = $('#' + JTF);
  $jtf.textfill({debug: false, maxFontPixels: 10});
  equal(console.debug_called, false);
});


