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

"use strict"
;(function ($) {
  var methods = {
    init: function(options) {
      this.each(function() {

        var $that = $(this);
        var that = {};
        this.utAudio = that;

        var defaults = {
          data: false,
          skin:'default',
          id:false,
          ui:{
            play:    true,
            progress:true,
            time:    true,
            title:   true,
            source:  true,
            artwork: true
          },
          editable: true,
          i18n:{
            add:    "add sound",
            change: "",
            error:  "Error occurred"
          }
        };

        that.options = $.extend(true, defaults, options);

        that.isTouch = (('ontouchstart' in window) || (window.navigator.msMaxTouchPoints > 0));
        that.sckey   = 'T8Yki6U2061gLUkWvLA';

        that.eventNS   = 'utAudio';
        that.storageNS = 'ut_audio_data';
        that.stateNS   = "ut-audio-state";
        that.editableNS= "ut-audio-editable";
        that.uiNS      = "ut-audio-ui";
        that.modeNS    = "ut-audio-mode";
        that.skinNS    = "ut-audio-skin";
        that.serviceNS = "ut-audio-service";
        that.aspectNS  = "ut-audio-aspect";
        that.sizeNS    = "ut-audio-size";
        that.touchNS   = "ut-audio-touch";

        if(that.options.ui === false){
          that.options.ui = {
            play:    false,
            progress:false,
            time:    false,
            title:   false,
            source:  false,
            artwork: false
          };
        } else if(that.options.ui === true) {
          that.options.ui = {
            play:    true,
            progress:true,
            time:    true,
            title:   true,
            source:  true,
            artwork: true
          };
        }

        that.requestSoundcloudAboutAppData = function(url,callback) {
          var requestTimeOut = 10000;
          var timeoutId = 0;
          var apiUrl = (document.location.protocol === 'https:' || (/^https/i).test(url) ? 'https' : 'http') + '://api.soundcloud.com/resolve?url=' + url + '&format=json&consumer_key=' + that.sckey + '&callback=?';
          $.getJSON(apiUrl, function(data) {
            if(timeoutId) {
              callback.call(this, data);
              clearTimeout(timeoutId);
              timeoutId = 0;
            }
          });
          timeoutId = setTimeout(function() {
            callback.call(this, {error: 'API error'});
          }, requestTimeOut);
        };

        that.setState = function(state) {
          that.currents.state = state;
          that.ui.container.removeClass().addClass(
            [
            that.uiNS,
            that.stateNS    + '-' + state,
            that.editableNS + '-' + ((that.options.editable && !that.post.context.player)?'true':'false'),
            (that.currents.serviceData?(that.serviceNS + '-' + that.currents.serviceData.service_name):''),
            that.skinNS     + '-' + that.options.skin,
            that.modeNS     + '-' +(that.post.context.player?'player':'editor'),
            that.aspectNS   + '-' + that.aspect,
            that.sizeNS     + '-' + that.size,
            that.touchNS    + '-' + (that.isTouch?'true':'false')
            ].join(' ')
            );
        };

        that.eventer = function(event,data){
          $that.trigger(that.eventNS+':'+event,data);
        };


        that.doNotMakeAnimationFlag = false;

        that.setPlayPos = function(ms,animationFlagSencitive) {
          if(that.doNotMakeAnimationFlag && animationFlagSencitive) {
            return false;
          }
          if(ms < 0 || !that.currents.serviceData) {
            return;
          }

          if(ms > that.currents.serviceData.duration) {
            ms = that.currents.serviceData.duration;
          }

          if(that.ui.progress){
            that.ui.progress.find('.'+that.uiNS+'-progress-playing').css("width", ((ms/that.currents.serviceData.duration)*100) + "%");
          }

          var timeInSeconds = Math.round(ms/1000);
          if(ms > 0){
            that.eventer('timeupdate',timeInSeconds);
          }

          if(that.currents.serviceData && that.currents.serviceData.duration) {
            var ts = '<span class="'+that.uiNS+'-progress-time-current">'+that.formatTime(ms) + '</span><span class="'+that.uiNS+'-progress-time-left">' + that.formatTime(that.currents.serviceData.duration) + '</span>';
            if(that.ui.time){
              that.ui.time.html(ts);
            }
          } else {
            if(that.ui.time){
              that.ui.time.html("");
            }
          }
          that.doNotMakeAnimationFlag = true;
          setTimeout(function(){
            that.doNotMakeAnimationFlag = false;
          },1000);
        };

        that.formatTime = function(ms) {
          var hms = {
            h: Math.floor(ms / (60 * 60 * 1000)),
            m: Math.floor((ms / 60000) % 60),
            s: Math.floor((ms / 1000) % 60)
          }, tc = [];
          if (hms.h > 0) {
            tc.push(hms.h);
          }
          tc.push((hms.m < 10 && hms.h > 0 ? '0' + hms.m : hms.m));
          tc.push((hms.s < 10 ? '0' + hms.s : hms.s));
          return tc.join(':');
        };

        that.updateUiContent = function() {
          var sed = that.currents.serviceData || {};

          if(that.ui.artwork && sed.artwork_url){
            var img = new window.Image();
            img.onload = function(){
              that.ui.artwork.css("backgroundImage", "url(" + sed.artwork_url + ")");
            };
            img.src = sed.artwork_url;
          }

          if(that.ui.play){
            that.ui.play
            .html('<span class="icon-spin '+that.uiNS+'-seek-icon"></span><span class="icon_play '+that.uiNS+'-play-icon"></span><span class="icon_pause '+that.uiNS+'-pause-icon"></span>')
            .on('click',function() {
              if(that.currents.state !== 'launch' && that.currents.state !== 'pause'){
                that.utPause();
              } else {
                that.utPlay();
              }
            })
            .on('touchend',function(){})
            .on('touchstart',function(){});
          }

          if(that.ui.title){
            that.ui.title
            .html(sed.title || '')
            .off('click').on('click', function (e) {
              e.stopPropagation();
            });
          }

          if(that.ui.progress){
            that.ui.progress
            .html('<span class="'+that.uiNS+'-progress-playing"></span><span class="'+that.uiNS+'-progress-marker"><span class="'+that.uiNS+'-progress-marker-time"></span><span class="'+that.uiNS+'-progress-time">');
          }

          if(!that.isTouch && that.ui.progress){

            that.ui.progress
            .off('mouseenter')
            .on('mouseenter', function(){
              if(that.currents.state === 'play' || that.currents.state === 'pause'){
                that.ui.progress.find('.'+that.uiNS+'-progress-marker').addClass(that.uiNS+'-progress-marker-visible');
              }
            })
            .off('mouseleave')
            .on('mouseleave', function(){
              that.ui.progress.find('.'+that.uiNS+'-progress-marker').removeClass(that.uiNS+'-progress-marker-visible');
            })
            .off('mousemove')
            .on('mousemove', function(e){
              var pos = e.pageX - that.ui.progress.offset().left;
              var time = that.currents.serviceData.duration/that.ui.progress.width() * pos;
              that.ui.progress.find('.'+that.uiNS+'-progress-marker').css('left',pos + 'px');
              that.ui.progress.find('.'+that.uiNS+'-progress-marker-time').html(that.formatTime(time));
            });
          }

          var _seekPlay = function(e) {
            var oo = that.ui.progress.offset();
            var px = e.pageX ? e.pageX : (e.originalEvent && e.originalEvent.pageX ? e.originalEvent.pageX : (e.originalEvent.touches && e.originalEvent.touches[0] && e.originalEvent.touches[0].pageX ? e.originalEvent.touches[0].pageX : 0));
            var pos = (px - parseInt(oo.left, 10))/that.ui.progress.width();
            if(that.currents.state === 'play' || that.currents.state === 'pause'){
              $that.utAudioEngine("seek", pos);
            }
          };

          if(that.ui.progress){
            that.ui.progress.on("touchstart mousedown", function(e) {
              _seekPlay(e);
            });
          }

          if(that.ui.source){
            that.ui.source
            .html('<span class="icon_'+(sed.service_name === "soundcloud"?'soundcloud':'sound') +' '+that.uiNS+'-source-icon"></span>')
            .prop('target','_blank')
            .prop('title','listen on '+sed.service_name);
          }

          if(that.post.context.player && that.ui.source){
            that.ui.source.prop('href',sed.source);
          }

          /* auto-start */
          if(that.options.autoPlay) {
            that.utPlay();
          }

          that.currents.videoDataRecived = true;
        };

        that.update = function(){

          that.currents = {
            id: that.options.id || $that.attr('id'),
            videoDataRecived: false,
            sourceEmbedData: null,
            state: 'loading'
          };

          if(!that.currents.id) {
            console.error('utAudio: Please specify an id of your audio container. Example: "<div id="myPlayer1"></div>"');
            return;
          } else if($('[id="'+that.currents.id+'"]').length > 1){
            console.error('utAudio: Your video container should have unique id. Now, more then one element have id = ',that.currents.id);
            return;
          }

          if(!that.post && UT && UT.Expression && UT.Expression.ready){
            UT.Expression.ready(function(post){
              that.post = post;
            });
          }

          if($that.utAudioEngine){
            that.utStop();
          }

          that.ui = {};
          if($that.css('position') !== "relative" && $that.css('position') !== "absolute"){
            $that.css('position','relative');
            if(console && console.warn) {
              console.warn('Your comtainer (id='+that.currents.id+') css position was set as "relative" as requirement of utAudio component. You can set it "absolute" or "relative" in the css to avoid this warning in console');
            }
          }
          $that.find('.'+that.uiNS).remove();
          that.ui.container = $('<div class="'+that.uiNS+'"></div>').appendTo($that);
          that.ui.error     = $('<div class="'+that.uiNS+'-error"></div>').append($('<div>').html(that.options.i18n.error)).appendTo(that.ui.container);
          that.ui.loading   = $('<div class="'+that.uiNS+'-loading"></div>').append('<div class="icon-spin '+that.uiNS+'-error-icon"></div>').appendTo(that.ui.container);
          if(that.options.ui.artwork)  { that.ui.artwork  = $('<div class="'+that.uiNS+'-artwork">'      ).appendTo(that.ui.container);}
          if(that.options.ui.title)    { that.ui.title    = $('<div class="'+that.uiNS+'-title">'        ).appendTo(that.ui.container);}
          if(that.options.ui.play)     { that.ui.play     = $('<div class="'+that.uiNS+'-play">'         ).appendTo(that.ui.container);}
          if(that.options.ui.progress) { that.ui.progress = $('<div class="'+that.uiNS+'-progress">'     ).appendTo(that.ui.container);}
          if(that.options.ui.time)     { that.ui.time     = $('<div class="'+that.uiNS+'-time">'         ).appendTo(that.ui.container);}
          if(that.options.ui.source)   { that.ui.source   = $('<a class="'+that.uiNS+'-source">'         ).appendTo(that.ui.container);}
          if(that.options.editable){
            var changeSound = function(){
              that.post.dialog('sound',{inputTypes:['search']},function(data){
                that.options.data = data;
                that.update();
                that.eventer('change');
                that.post.storage[that.storageNS+'_'+that.currents.id] = JSON.stringify(data);
                that.post.storage.save();
              });
            };
            that.ui.add     = $('<a class="'+that.uiNS+'-add icon_sound"></a>').html(that.options.i18n.add).appendTo(that.ui.container).on('click',changeSound);
            that.ui.remove  = $('<a class="'+that.uiNS+'-remove icon_trash"></a>').html(that.options.i18n.change).appendTo(that.ui.container).on('click',changeSound);
          }

          that.aspect = 'square'; //TODO - make it more clear
          if($that.width() > $that.height()*1.25) {that.aspect = 'horizontal';}
          if($that.width()*1.25 < $that.height()) {that.aspect = 'vertical';}

          that.size = 'middle'; //TODO - make it more clear
          if($that.width() > 300 || $that.height() > 300) {that.size = 'big';}
          if($that.width() <= 200 || $that.height() <= 200) {that.size = 'small';}

          if(that.post){
            that.post.on('pause',that.utPause);
          }

          that.getServiceName = function(){
            if(that.options.data && that.options.data.service){
              return that.options.data.service;
            } else {
              if(that.options.data && that.options.data.url && that.options.data.url.toLowerCase().indexOf('soundcloud')!==-1){
                return 'soundcloud';
              } else {
                var error = 'Something went wrong with defining service name that you want to play';
                console.error(error,that.options.data);
                that.setState('error',error);
                return false;
              }
            }
          };

          that.formatServiceData = function(data){
            if (that.getServiceName() === 'soundcloud') {
              that.currents.serviceData = {
                title:       data.title,
                source:      data.permalink_url,
                artwork_url: (data.artwork_url?data.artwork_url:'').replace(/\-large\./ig, "-t500x500."),
                duration:    data.duration
              };
            } else if(that.getServiceName() === 'itunes') {
              that.currents.serviceData = {
                title:       data.artistName + ' - ' + data.trackName,
                source:      data.trackViewUrl,
                artwork_url: (data.artworkUrl100?data.artworkUrl100:'').replace("100x100","600x600"),
                duration:    30000//data.trackTimeMillis
              };
            }
            that.currents.serviceData.service_name = that.getServiceName();
          };

          that.requestServiceData = function(callback){
            setTimeout(function(){
              if(that && (!that.currents || !that.currents.serviceData)){
                that.setState('error', "We can't get data to play this track in 15 sec");
              }
            },15000);
            if(that.options.data.appData){
              callback(that.options.data.appData);
            } else if (that.getServiceName() === 'soundcloud') {
              that.requestSoundcloudAboutAppData(that.options.data.url, function(data) {
                callback(data);
              });
            } else if (that.getServiceName() === 'itunes') {
              console.error('Sorry we can not play track by direct itunes link for now.');
            }
          };

          that.setupServiceDataIntoPlayer = function(data){
            var type,url;
            if (that.getServiceName() === 'soundcloud') {
              url = data.stream_url + (/\?/.test(data.stream_url) ? '&' : '?') + 'consumer_key=' + that.sckey;
              type = "mp3";
            } else {
              url = data.previewUrl;
              type = "m4a";
            }

            that.formatServiceData(data);

            that.utAudioEngineOptions = {
              duration: that.currents.serviceData && that.currents.serviceData.duration ? that.currents.serviceData.duration : false,
              url:url,
              type:type,
              onReady: function() {
                that.setPlayPos(0);
              },
              onPlay: function() {
                that.setState('play');
                that.eventer('play');
              },
              onPause: function() {
                that.setState('pause');
                that.eventer('pause');
                that.setPlayPos(-1);
              },
              onStop: function() {
                that.setState('launch');
                that.eventer('stop');
                that.setPlayPos(-1);
              },
              onFinish: function() {
                that.setState('launch');
                that.eventer('finish');
                that.setPlayPos(-1);
              },
              onSeekStart: function() {
                that.setState('seek');
                that.eventer('seek');
              },
              onSeekEnd: function() {
                that.setState('play');
              },
              onTimeUpdate: function(pos) {
                that.setPlayPos(pos,true);
              },
              onError: function(message){
                that.eventer('error',message);
                that.setState('error');
                that.setPlayPos(-1);
              }
            };

            that.updateUiContent();

            if($that.utAudioEngine) {
              that.setState('launch');
              $that.utAudioEngine(that.utAudioEngineOptions);
              setTimeout(function(){
                that.eventer('canplay',that.currents.serviceData);
              },10);
            } else {
              that.setState('error',"Sound Player !!! The library not found.");
            }
          };

          var storege_data = that.post.storage[that.storageNS+'_'+that.currents.id];
          if(storege_data && !that.options.data) {
            that.options.data = JSON.parse(storege_data);
          }

          if(typeof(that.options.data) === 'string'){
            that.options.data = {url:that.options.data}; //
          }

          if(that.options.data && (that.options.data.appData || that.options.data.url)) {
            that.setState("loading");
            that.requestServiceData(that.setupServiceDataIntoPlayer);
          } else {
            that.setState("empty");
          }
        };

        that.utPlay = function(v) {
          if($that.utAudioEngine) {
            $that.utAudioEngine("play",v);
          }
        };

        that.utPause = function() {
          if($that.utAudioEngine) {
            $that.utAudioEngine("pause");
          }
        };

        that.utStop = function() {
          if($that.utAudioEngine){
            $that.utAudioEngine("stop");
          }
          that.setPlayPos(-1);
        };

        that.utVolume = function(v) {
          if($that.utAudioEngine) {
            $that.utAudioEngine("volume",v);
          }
        };

        that.utChange = function(data) {
          that.options.data = data;
          that.update();
        };

        that.utDestroy = function() {
          that.ui.container.remove();
          that = null;
        };

        that.update();
        setTimeout(function(){
          that.eventer('ready');
        },0);
      });
      return this;
    },

    play: function(v) {
      this.each(function() {
        if(this.utAudio && this.utAudio.utPlay) {
          this.utAudio.utPlay.call(this,v);
        }
      });
      return this;
    },

    pause: function() {
      this.each(function() {
        if(this.utAudio && this.utAudio.utPause) {
          this.utAudio.utPause.call(this);
        }
      });
      return this;
    },

    stop: function() {
      this.each(function() {
        if(this.utAudio && this.utAudio.utStop){
          this.utAudio.utStop.call(this);
        }
      });
      return this;
    },

    volume: function(v) {
      this.each(function() {
        if(this.utAudio && this.utAudio.utVolume){
          this.utAudio.utVolume.call(this,v);
        }
      });
      return this;
    },

    change: function(data) {
      this.each(function() {
        if(this.utAudio && this.utAudio.utChange){
          this.utAudio.utChange.call(this,data);
        }
      });
      return this;
    },

    destroy: function() {
      this.each(function() {
        if(this.utAudio && this.utAudio.utDestroy){
          this.utAudio.utDestroy.call(this);
        }
      });
      return this;
    }
  };



  $.fn.utAudio = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on $.utAudio');
    }
    return this;
  };
  $.utAudio_height = 78;

})(window.$ || window.Zepto || window.jq);

