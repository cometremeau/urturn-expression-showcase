(function($) {
  // Define default scroll settings
  var defaults = {
    y: 0,
    x: 0,
    scrollHeight: 0,
    scrollWidth: 0,
    vScroll: false,
    hScroll: true,
    elastic: !navigator.userAgent.match(/android/i),
    momentum: true,
    elasticDamp: 0.6,
    elasticTime: 50,
    reboundTime: 400,
    momentumDamp: 0.9,
    momentumTime: 300,
    iPadMomentumDamp: 0.95,
    iPadMomentumTime: 1200,
    touchTags: ['select', 'input', 'textarea']
  };

  // Define methods
  var methods = {
    init: function(options) {
      return this.each(function() {
        var self = this;
        self.scrollOptions = {};
        $.extend(self.scrollOptions, defaults);
        $.extend(self.scrollOptions, options);

        // Prevent double-init, just update instead
        if (!!this._init) {
            return this.update();
        }
        this._init = true;

        // Define element variables
        var $this = $(this),
            scrollY = -self.scrollOptions.y,
            scrollX = -self.scrollOptions.x,
            touchY = 0,
            touchX = 0,
            movedY = 0,
            movedX = 0,
            pollY = 0,
            pollX = 0,
            height = 0,
            width = 0,
            maxHeight = 0,
            maxWidth = 0,
            scrollHeight = 0,
            scrollWidth = 0,
            scrolling = false,
            bouncing = false,
            moved = false,
            timeoutID,
            isiPad = !!navigator.platform.match(/ipad/i),
            hasMatrix = 'WebKitCSSMatrix' in window,
            has3d = hasMatrix && 'm11' in new WebKitCSSMatrix();

        // Keep bottom of scroll area at the bottom on resize
        var update = this.update = function() {
          if (self.scrollOptions.hScroll) {
            self.scrollOptions.vScroll = false;
            // width setup
            width = $this.parent().width();
            scrollWidth = $this.width();
            maxWidth = width - scrollWidth;
          }
          if (self.scrollOptions.vScroll) {
            // height setup
            height = $this.parent().height();
            scrollHeight = $this.height();
            maxHeight = height - scrollHeight;
          }
          clearTimeout(timeoutID);
          clampScroll(false);
        };

        // Set up initial variables
        update();

        var isFF = (navigator.userAgent.indexOf("Firefox") != -1);

        // Set up transform CSS
        if(!isFF) {
          $this.css({'-webkit-transition-property': '-webkit-transform',
            '-webkit-transition-timing-function': 'cubic-bezier(0,0,0.2,1)',
            '-webkit-transition-duration': '1s',
            '-webkit-transform': cssTranslate(scrollX, scrollY)});
        } else {
          $this.css({'-moz-transition-property': '-moz-transform',
            '-moz-transition-timing-function': 'cubic-bezier(0,0,0.2,1)',
            '-moz-transition-duration': '1s',
            '-moz-transform': cssTranslate(scrollX, scrollY)});
        }
        // Listen for screen size change event
        // this shit cause bug with 2 times calculation of maxWidth
        // second time it is 0, because it is hidden for wdChooser plugin
        // that's why I removed it for now (Dmitry)
        // window.addEventListener('onorientationchange' in window ? 'orientationchange' : 'resize', update, false);

        // Listen for touch events
        $this.bind('touchstart.touchScroll', touchStart);
        $this.bind('touchmove.touchScroll', touchMove);
        $this.bind('touchend.touchScroll touchcancel.touchScroll', touchEnd);
        if(!isFF) $this.bind('webkitTransitionEnd.touchScroll', transitionEnd);
        else $this.bind('mozTransitionEnd.touchScroll', transitionEnd);

        // Set the position of the scroll area using transform CSS
        var setPosition = this.setPosition = function(x, y) {
          scrollX = x;
          scrollY = y;

          if(!isFF) {
            $this.css({'-webkit-transition-property': '-webkit-transform',
              '-webkit-transition-timing-function': 'cubic-bezier(0,0,0.2,1)',
              '-webkit-transition-duration': '3000',
              '-webkit-transform': cssTranslate(scrollX, scrollY)});
          } else {
            $this.css({'-moz-transition-property': '-moz-transform',
              '-moz-transition-timing-function': 'cubic-bezier(0,0,0.2,1)',
              '-moz-transition-duration': '3000',
              '-moz-transform': cssTranslate(scrollX, scrollY)});
          }
        };

        // Transform using a 3D translate if available
        function cssTranslate(x, y) {
          return 'translate' + (has3d ? '3d(' : '(') + x + 'px,' + y + 'px' + (has3d ? ',0)' : ')');
        }

        // Set CSS transition time
        function setTransitionTime(time) {
          time = time || '0';
          if(!isFF) $this.css('-webkit-transition-duration', time + 'ms');
          else $this.css('-moz-transition-duration', time + 'ms');
        }

        // Get the actual pixel position made by transform CSS
        function getPosition() {
          if (hasMatrix) {
            var compStyle = window.getComputedStyle($this[0]);
            var transform = compStyle.webkitTransform ? compStyle.webkitTransform : null;
            if (!!transform && transform !== 'none') {
              var matrix = new WebKitCSSMatrix(transform);
              return { x: matrix.e, y: matrix.f };
            }
          }
          return { x: scrollX, y: scrollY };
        }


        this.getPosition = function() {
          //inator modified to return proper position depending on scroll orientation
          if (self.scrollOptions.hScroll) {
            return getPosition().x;
          } else {
            return getPosition().y;
          }
        };

        // //Expose getPosition API
        // this.getPosition = function() {
        //   return getPosition();
        // };

        // Bounce back to the bounds after momentum scrolling
        function reboundScroll() {
          if (scrollX > 0 && scrollY > 0) {
            scrollTo(0, 0, self.scrollOptions.reboundTime);
          } else if (scrollX > 0) {
            scrollTo(0, scrollY, self.scrollOptions.reboundTime);
          } else if (scrollY > 0) {
            scrollTo(scrollX, 0, self.scrollOptions.reboundTime);
          } else if (scrollX < maxWidth && scrollY < maxHeight) {
            scrollTo(maxWidth, maxHeight, self.scrollOptions.reboundTime);
          } else if (scrollX < maxWidth) {
            scrollTo(maxWidth, scrollY, self.scrollOptions.reboundTime);
          } else if (scrollY < maxHeight) {
            scrollTo(scrollX, maxHeight, self.scrollOptions.reboundTime);
          }
        }

        // Stop everything once the CSS transition in complete
        function transitionEnd() {
          if (bouncing) {
            bouncing = false;
            reboundScroll();
          }
          clearTimeout(timeoutID);
        }

        // Limit the scrolling to within the bounds
        function clampScroll(poll) {
          if (!hasMatrix || bouncing) {
            return;
          }

          var oldX = pollX;
          pollX = getPosition().x;

          var oldY = pollY;
          pollY = getPosition().y;

          if (pollX > 0 || pollY > 0) {
            if (self.scrollOptions.elastic) {
              // Slow down outside top bound
              bouncing = true;
              scrollX = (pollX > 0) ? 0 : pollX ;
              scrollY = (pollY > 0) ? 0 : pollY ;
              momentumScroll(pollX - oldX, pollY - oldY, self.scrollOptions.elasticDamp, 1, width, height, self.scrollOptions.elasticTime);
            } else {
              // Stop outside top bound
              var x = (pollX > 0) ? 0 : pollX ;
              var y = (pollY > 0) ? 0 : pollY ;
              setTransitionTime(0);
              setPosition(x, y);
            }
          } else if (pollX < maxWidth || pollY < maxHeight) {
            if (self.scrollOptions.elastic) {
              // Slow down outside bottom bound
              bouncing = true;
              scrollX = (pollX > maxHeight) ? maxHeight : pollX ;
              scrollY = (pollY > maxHeight) ? maxHeight : pollY ;
              momentumScroll(pollX - oldX, pollY - oldY, self.scrollOptions.elasticDamp, 1, width, height, self.scrollOptions.elasticTime);
            } else {
              // Stop outside bottom bound
              var x = (pollX > maxWidth) ? maxWidth : pollX ;
              var y = (pollY > maxHeight) ? maxHeight : pollY ;
              setTransitionTime(0);
              setPosition(x, y);
            }
          } else if (poll) {
            // Poll the computed position to check if element is out of bounds
            timeoutID = setTimeout(clampScroll, 20, true);
          }
        }

        // Animate to a position using CSS
        function scrollTo(destX, destY, time) {
          if (destX === scrollX && destY === scrollY) {
              return;
          }

          moved = true;
          setTransitionTime(time);
          setPosition(destX, destY);
        }

        // Perform a momentum-based scroll using CSS
        function momentumScroll(dxin, dyin, k, minDist, maxDistX, maxDistY, t) {
          var adx = Math.abs(dxin),
              ady = Math.abs(dyin),
              dx = 0,
              dy = 0;

          // Calculate the total distance
          while (adx > 0.1) {
            adx *= k;
            dx += adx;
          }
          while (ady > 0.1) {
            ady *= k;
            dy += ady;
          }

          // Limit to within min and max distances
          if (dx > maxDistX) {
            dx = maxDistX;
          }
          if (dy > maxDistY) {
            dy = maxDistY;
          }
          if (dx > minDist) {
            if (dxin < 0) {
                dx = -dx;
            }
            dx += scrollX;

            // If outside the bounds, don't go too far
            if (width > 0) {
              if (dx > width * 2) {
                dx = width * 2;
              } else if (dx < maxWidth - width * 2) {
                dx = maxWidth - width * 2;
              }
            }
          }
          if (dy > minDist) {
            if (dyin < 0) {
              dy = -dy;
            }
            dy += scrollY;

            // If outside the bounds, don't go too far
            if (height > 0) {
              if (dy > height * 2) {
                dy = height * 2;
              } else if (dy < maxHeight - height * 2) {
                dy = maxHeight - height * 2;
              }
            }
          }
          if (Math.abs(dx) > minDist || Math.abs(dy) > minDist) {
            // Perform scroll
            scrollTo(Math.round(dx), Math.round(dy), t);
          }
          clampScroll(true);
        }

        // Get the touch points from this event
        function getTouches(e) {
          if (e.originalEvent) {
            if (e.originalEvent.touches && e.originalEvent.touches.length) {
              return e.originalEvent.touches;
            } else if (e.originalEvent.changedTouches && e.originalEvent.changedTouches.length) {
              return e.originalEvent.changedTouches;
            }
          }
          return (e.touches[0]?e.touches:e.changedTouches);
        }

        // Dispatches a fake mouse event from a touch event
        function dispatchMouseEvent(name, touch, target) {
          var e = document.createEvent('MouseEvent');
          e.initMouseEvent(name, true, true, touch.view, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
          target.dispatchEvent(e);
        }

        // Find the root node of this target
        function getRootNode(target) {
          while (target.nodeType !== 1) {
            target = target.parentNode;
          }
          return target;
        }

        // Perform a touch start event
        function touchStart(e) {
          // Allow certain HTML tags to receive touch events
          if ($.inArray(e.target.tagName.toLowerCase(), self.scrollOptions.touchTags) !== -1) {
            return;
          }

          // Stop the default touches
          e.preventDefault();
          e.stopPropagation();

          var touch = getTouches(e)[0];

          // Dispatch a fake mouse down event
          dispatchMouseEvent('mousedown', touch, getRootNode(touch.target));

          scrolling = true;
          moved = false;
          movedX = 0;
          movedY = 0;

          clearTimeout(timeoutID);
          setTransitionTime(0);

          // Check scroll position
          if (self.scrollOptions.momentum) {
            var x = getPosition().x;
            var y = getPosition().y;
            if (x !== scrollX || y !== scrollY) {
              setPosition(x, y);
              moved = true;
            }
          }

          touchX = touch.pageX - scrollX;
          touchY = touch.pageY - scrollY;
        }

        // Perform a touch move event
        function touchMove(e) {
          if (!scrolling) {
            return;
          }

          var dx = getTouches(e)[0].pageX - touchX;
          var dy = getTouches(e)[0].pageY - touchY;

          // Elastic-drag or stop when moving outside of boundaries
          if (dx > 0) {
            if (self.scrollOptions.elastic) {
              dx /= 2;
            } else {
              dx = 0;
            }
          } else if (dx < maxWidth) {
            if (self.scrollOptions.elastic) {
              dx = (dx + maxWidth) / 2;
            } else {
              dx = maxWidth;
            }
          }
          if (dy > 0) {
            if (self.scrollOptions.elastic) {
              dy /= 2;
            } else {
              dy = 0;
            }
          } else if (dy < maxHeight) {
            if (self.scrollOptions.elastic) {
              dy = (dy + maxHeight) / 2;
            } else {
              dy = maxHeight;
            }
          }

          if (self.scrollOptions.hScroll) {
            movedX = dx - scrollX;
          } else {
            dx = 0;
          }
          if (self.scrollOptions.vScroll) {
            movedY = dy - scrollY;
          } else {
            dy = 0;
          }

          moved = true;
          setPosition(dx, dy);
        }

        // Perform a touch end event
        function touchEnd(e) {
          if (!scrolling) {
            return;
          }

          scrolling = false;

          if (moved) {
            // Ease back to within boundaries
            if ((scrollX > 0 || scrollX < maxWidth) || (scrollY > 0 || scrollY < maxHeight)) {
              reboundScroll();
            } else if (self.scrollOptions.momentum) {
              // Free scroll with momentum
              momentumScroll(movedX, movedY, isiPad ? self.scrollOptions.iPadMomentumDamp : self.scrollOptions.momentumDamp, 40, 2000, 2000, isiPad ? self.scrollOptions.iPadMomentumTime : self.scrollOptions.momentumTime);
            }
          } else {
            var touch = getTouches(e)[0];
            var target = getRootNode(touch.target);

            // Dispatch fake mouse up and click events if this touch event did not move
            dispatchMouseEvent('mouseup', touch, target);
            dispatchMouseEvent('click', touch, target);
          }
        }
      });
    },

    update: function() {
      return this.each(function() {
        this.update();
      });
    },

    getPosition: function() {
      var a = [];
      this.each(function() {
        a.push(-this.getPosition());
      });
      return a;
    },

    setPosition: function(x, y) {
      return this.each(function() {
        this.setPosition(-x, -y);
      });
    }
  };

  // Public method for touchScroll
  $.fn.touchScroll = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      methods.init.apply(this, arguments);
    } else {
      $.error('Method ' +  method + ' does not exist on $.touchScroll');
    }
    return this;
  };
})(window.jQuery || window.Zepto || window.jq);
