/*global UT: true, jQuery: true, navigator: true, fontdetect: true */
/*
 * This source code is licensed under version 3 of the AGPL.
 *
 * Copyright (c) 2013 by urturn
 *
 * Addendum to the license AGPL-3:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 */
;(function($) {
  "use strict";
  /**
   * Enhace the given domNode to make it an editable text field
   *
   * It can be fluid in size, adapt to his container, limit the
   * number of characters, and be mixed with an ut-image
   *
   * Data(the text) will be stored in that object in the collection:
   * - ut-text_[element.id]
   */

  function UtText(element, options) {
    options = $.extend({}, $.fn.utText.defaults, options);

    var el            = element,
      $el             = $(el),
      namespace       = 'utText',
      storageKey      = namespace+el.id,
      post            = options.post || {},
      storage         = post.storage,
      mode            = post.context,
      maxFontSize     = parseInt(options.maxFontSize,10) || null,
      minFontSize     = parseInt(options.minFontSize,10) || null,
      isUtimage       = $el.data('utImage'),
      isIosApp        = /(urturn)/i.test(navigator.userAgent),
      isIE            = /(msie)/i.test(navigator.userAgent),
      $contentDomNode,timer,$countdownDomNode,imageHeight;

    function init() {
      $contentDomNode = $('<div>').addClass('ut-text-content');

      $el
      .addClass('ut-text')
      .append($contentDomNode);

      if (!options.fixedSize) {
        $el.addClass('ut-text-flex');

      } else {
        $el.addClass('ut-text-fixed');
      }

      if (options.chars && mode && mode.editor === true) {
        $countdownDomNode = $('<div>').addClass('ut-text-countdown ut-action-button ut-small-button ut-button');
        $el.append($countdownDomNode);
        updateCharactersCounter();
      }

      if (mode && mode.editor === true) {
        $contentDomNode
        .attr('contentEditable',true)
        .attr('spellcheck',false);
        bindEvents();
      }
      if (storage && storage[storageKey]) {
        $contentDomNode.text(storage[storageKey]);
        $contentDomNode.attr('data-div-placeholder-content', 'true');

        setTimeout(function() {
          sizeChange();
        }, 50);
      }

      if (isUtimage) {
        imageHeight = $el.height();
        $el.css({ backgroundSize: 'cover' });
      }

      if(options.reuse) {
        reuse();
      }

      trigger('ready');

    }

    function trigger(name, data){
      $el.trigger(namespace+':'+name, data);
    }

    /*
      - Listen to events on the contenteditable field
      - use native text dialog if we are in the iOS app
      - handle copy-paste text
    */
    function bindEvents() {

      $el.on('click',function() {
        $contentDomNode.trigger('focus');
        if ($contentDomNode[0].textContent.length === 0) {
          $contentDomNode.html('<br/>');
        }
      });
      /* here is the meat and potates */
      $contentDomNode.attr('data-placeholder',options.placeholder);

      if (isIosApp) {
        $contentDomNode.on('touchstart',function() {
          post.dialog('text',{'value':cleanUpData(), 'max':options.chars || null, 'multiline':true}, function(text){
            $contentDomNode.html(text).trigger('input');
            trigger('mobileInput',text);
            if (text.length >= 1) {
              $contentDomNode.attr('data-div-placeholder-content', 'true');
            }
            adaptAndSave();
          });
        });
      } else {
        $contentDomNode.on('paste keypress keydown input',function(e) {
          if (mode && mode.editor === true) {
            if ($contentDomNode[0].textContent && $contentDomNode[0].textContent.length >= 1) {
              $contentDomNode.attr('data-div-placeholder-content', 'true');
            } else {
              $contentDomNode.removeAttr('data-div-placeholder-content');
            }
          }

          if (e.type === 'paste') {
            formatPaste();
          }

          if(e.which === 13 && isIE) {
            e.preventDefault();
          }

          //list of functional/control keys that you want to allow always
          var keys = [8, 9, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 144, 145];

          if( $.inArray(e.keyCode, keys) === -1) {
            if (options.chars && $contentDomNode[0].innerHTML.length >= options.chars) {
              e.preventDefault();
              e.stopPropagation();
            }
          }

          if(timer) {
            clearTimeout(timer);
          }
          timer = setTimeout(adaptAndSave, 50);

        });
      }
    }

    /*
      Either the post, the font, or the ut-image object can adapt the height
      The font in the case we have a fixed element size
      The post when the size is free and as more as we type
      The ut-image when it's present, the image grow as we type
    */
    function sizeChange() {
      if (options.fixedSize) {
        adaptFontSize();
      } else {
        if (isUtimage) {
          adaptImageHeight();
        } else {
          adaptPostHeight();
        }
      }

      if (options.chars && mode && mode.editor === true) {
        updateCharactersCounter();
      }
    }

    function adaptImageHeight() {
      if ($contentDomNode.outerHeight()+10 > imageHeight) {
        $el.height($contentDomNode.outerHeight()+10);
      } else {
        $el.height(imageHeight);
      }
    }

    function adaptPostHeight() {
      post.size({'height':$('.webdoc_expression_wrapper').outerHeight()});
    }

    function adaptFontSize() {
      var fontName = fontdetect.whichFont(el);

      fontdetect.onFontLoaded(fontName, function(){
        $el.textfill({
          debug: false,
          maxFontPixels: maxFontSize,
          minFontPixels: minFontSize,
          innerTag: '.ut-text-content'
        });
      }, function(){
        $el.textfill({
          debug: false,
          maxFontPixels: maxFontSize,
          minFontPixels: minFontSize,
          innerTag: '.ut-text-content'
        });
       }, {msInterval: 100, msTimeout: 10000});
    }

    /* Adapt size and save */
    function adaptAndSave() {
      sizeChange();
      saveData();
    }

    /* Save the text in collection */
    function saveData() {
      storage[storageKey] = cleanUpData();
      post.save();

      trigger('save',cleanUpData());
    }

    /* in the case we have a character limitation, display and update the counter */
    function updateCharactersCounter() {
      var remaining = options.chars - $contentDomNode[0].innerHTML.length;
      if (remaining === 0) {
        $countdownDomNode.addClass('ut-text-countdown-max');
      } else {
        $countdownDomNode.removeClass('ut-text-countdown-max');
      }
      $countdownDomNode.text(remaining + ' / ' + options.chars);
    }

    /* Clean up the data that come from copy, paste, etc... before saving */
    function cleanUpData(){
      var v = $contentDomNode.html().replace(/<br\s*\/?>/mg,"\n");
      v = v.replace(/(<([^>]+)>)/ig,'');
      return $.trim(v.replace(/&nbsp;/ig,''));
    }

    function formatPaste() {
      setTimeout(function() {
        if(options.chars && $contentDomNode[0].innerHTML.length >= options.chars) {
          $contentDomNode.text(cleanUpData().substr(0, options.chars));
        } else {
          $contentDomNode.text(cleanUpData());
        }
      }, 50);
    }

    /* Reuse data from the parent post */
    function reuse() {
      if(!storage[storageKey] && post.collection('parent') && post.collection('parent')[storageKey]){
        $contentDomNode.html(post.collection('parent')[storageKey]);
        $contentDomNode.attr('data-div-placeholder-content', 'true');
        saveData();
      }
    }

    function destroy() {
      $el.each(function() {
        $el.trigger('destroy');
        $el
          .removeData('utText')
          .removeClass('ut-text ut-text-editable ut-text-placeholder')
          .remove('.ut-text-content');
        $contentDomNode.off();
      });
    }

    init();

    return {
      options:        options,
      destroy:        destroy,
      sizeChange:     sizeChange,
      adaptFontSize:  adaptFontSize,
      getText:        cleanUpData,
      saveText:       saveData
    };
  }

  $.fn.utText = function(options) {
    if (typeof arguments[0] === 'string') {
      var methodName = arguments[0];
      var args = Array.prototype.slice.call(arguments, 1);
      var returnVal;
      this.each(function() {
        if ($.data(this, 'utText') && typeof $.data(this, 'utText')[methodName] === 'function') {
          returnVal = $.data(this, 'utText')[methodName].apply(this, args);
        } else {
          throw new Error('Method ' +  methodName + ' does not exist on jQuery.utText');
        }
      });
      if (returnVal !== undefined){
        return returnVal;
      } else {
        return this;
      }
    } else if (typeof options === "object" || !options) {
      return this.each(function() {
        if (!$.data(this, 'utText')) {
          if((!options || !options.post) && UT && UT.Expression && UT.Expression.ready){
            UT.Expression.ready(function(post){
              if (!options) {
                options = {};
              }
              options.post = post;
            });
          }
          $.data(this, 'utText', new UtText(this, options));
        }
      });
    }
  };

  $.expr[':'].utText = function(el) {
    return $(el).hasClass('ut-text');
  };

  $.fn.utText.defaults = {
    placeholder: 'Enter some text',
    fixedSize: false,
    chars: false,
    maxFontSize: Number.POSITIVE_INFINITY,
    minFontSize: Number.NEGATIVE_INFINITY,
    reuse: false
  };

})(jQuery);