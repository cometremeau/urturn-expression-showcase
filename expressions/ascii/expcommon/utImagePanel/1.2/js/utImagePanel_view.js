(function($) {
  $.fn.utImagePanel = function(params) {
    var defParam = {
      data: null,
      sourceLinkPos: "bottom",
      hideSource: false
    };
    var prm = $.extend(true, defParam, params);
    var $that = $(this);
    var that = {};
    $that.addClass("utImagePanel");
    $that.addClass("utImagePanel_loading");
    if($.browser.mobile) $that.addClass("mobile");
    if(prm.data && prm.data.url) {
      var img = new Image();
      img.onload = function(){
        var tmp = $that[0].getAttribute("style") || "";
        tmp = tmp.replace(/background\-image\:([^\(^;]+\([^\)]+\)+|[^;]*);?/ig, "");
        $that[0].setAttribute("style", tmp + 'background-image:url("' + prm.data.url + '")');
        $that.removeClass("utImagePanel_loading").addClass("utImagePanel_full");
      };
      img.src = prm.data.url;
    }
    if(!prm.hideSource && prm.data && prm.data.info && prm.data.info.source) {
      var tmp = prm.data.info.source.match(/\/\/([^\/]+)\//i);
      if(!tmp || !tmp[0]) tmp = prm.data.info.source.replace(/^http(s)?\:/i, "").match(/^([^\/]+)\//i);
      if(tmp && tmp[0]) {
        var imgDomainName = (tmp[1] ? tmp[1] : tmp[0]).replace(/(^(\/\/)?www\.|\/)/g, "");
        if(imgDomainName.length <= 0 || imgDomainName.indexOf('urturn.com') !== -1) {
          return this;
        }

        var cLink = prm.data.info.source;
        if(!cLink.match(/^http\:\/\/|^https\:\/\/|^\/\//i)) {
          cLink = "//" + cLink;
        }
        $that.append('<a class="sourceLink" href="' + cLink + '" target="_blank"><span class="sourceLinkIcon icon_link"></span><span class="sourceLinkText">' + imgDomainName + '</span></div>');
        $that.find(".sourceLink").css(prm.sourceLinkPos, "0");
     }
    }
    if($.browser.mobile) {
      $that.on("click", function() {
        var isshow = !!$that.find(".sourceLink").hasClass('show');
        $(".utImagePanel .sourceLink").removeClass('show');
        if(!isshow) $that.find(".sourceLink").addClass('show');
      });
    }

    function checkSize() {
      var obj = $that.find('.sourceLinkText');
      if (obj.height() > 40) {
        var text = obj.html();
        text = text.substring(0, text.length - 1);
        obj.html(text);
        checkSize();
      } else {
        if (imgDomainName != obj.html()) {
          var tmp = obj.html();
          tmp = tmp.substring(0, tmp.length - 3) + '...';
          obj.html(tmp);
        }
      }
    }

    checkSize();

    return this;
  };

})(window.jQuery || window.Zepto || window.jq);
