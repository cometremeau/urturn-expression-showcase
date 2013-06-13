(function(window){
  window.utils = window.utils || {};

  window.utils.removeTagFromString = function(str, tag) {
    if(!str || !tag || str.length <= 0) return str;
    tag = "#" + tag.replace(/[^0-9a-z]/ig, "").toLowerCase();
    var re = new RegExp("([^0-9a-z]*"+tag+"$|"+tag+"[^0-9a-z]+?|^"+tag+"$)", "ig");
    return str.replace(re, "");
  };

  window.utils.addTagToString = function(str, tag, toTheEnd) {
    if(!tag) return str;
    if(!str) str = "";
    tag = "#" + tag.replace(/[^0-9a-z]/ig, "").toLowerCase();
    var re = new RegExp("([^0-9a-z]*"+tag+"$|"+tag+"[^0-9a-z]+?|^"+tag+"$)", "ig");
    var res = str.match(re);
    if(res) return str;
    if(toTheEnd === true) return str + (str.length > 0 ? " " : "") + tag;
    else return tag + (str.length > 0 ? " " : "") + str;
  };

  window.utils.synsCaller = function(funcWithCallback) {
    if(funcWithCallback === false) {
      window.utils.synsCaller._stackList = [];
      return;
    }
    if(funcWithCallback !== null) window.utils.synsCaller._stackList.push(funcWithCallback);
    if(window.utils.synsCaller._inProcess) return;
    if(window.utils.synsCaller._stackList.length <= 0) {
      window.utils.synsCaller._inProcess = false;
      return;
    }
    window.utils.synsCaller._inProcess = true;
    var synsCallerLoop = function() {
      // get next function
      var ff = window.utils.synsCaller._stackList.shift();
      // if no data -- stop loop
      if(!ff) {
        window.utils.synsCaller._inProcess = false;
        return;
      }
      // call and wait
      ff.call(this, function() { setTimeout(synsCallerLoop, 0); });
    };
    // run loop
    setTimeout(synsCallerLoop, 0);
  };
  window.utils.synsCaller._stackList = [];
  window.utils.synsCaller._inProcess = false;

  window.utils.setSingleTimeout = function(id, func, timeOut) {
    if(!window.utils.setSingleTimeout._singleTimeoutIds) window.utils.setSingleTimeout._singleTimeoutIds = {};
    if(window.utils.setSingleTimeout._singleTimeoutIds[id]) {
      clearTimeout(window.utils.setSingleTimeout._singleTimeoutIds[id]);
      delete (window.utils.setSingleTimeout._singleTimeoutIds[id]);
    }
    if(func) {
      window.utils.setSingleTimeout._singleTimeoutIds[id] = setTimeout(function(){
        delete (window.utils.setSingleTimeout._singleTimeoutIds[id]);
        func && func.call(this);
      }, timeOut);
      return window.utils.setSingleTimeout._singleTimeoutIds[id];
    }
  };
  window.utils.setSingleTimeout._singleTimeoutIds = null;

  /********************************************************************************
   * apply styles with delay
   * @param stylesData - array with objects like:
   *        {delay:..., styles:...}, where:
   *        delay -- time before apply styles
   *        styles -- object with styles to apply through $.css(...)
   ********************************************************************************/
  window.utils.delayStyleChanger = function(obj, stylesData) {
    var $obj = $(obj);
    var data = jQuery.extend(true, [], stylesData);
    var num = 0;
    var nextStep = function() {
      setTimeout(function() {
        if(data[num].styles) $obj.css(data[num].styles);
        num++;
        if(data[num] && typeof(data[num].delay) != "undefined") nextStep();
      }, data[num].delay);
    };
    if(data[num] && typeof(data[num].delay) != "undefined") nextStep();
  };
})(window);