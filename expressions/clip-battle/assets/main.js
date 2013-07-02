UT.Expression.ready(function(post) {
  var $video = $('.video');
  var $node = $(post.node);
  var $voteBox = $('.voteBox');
  var $voteLink = $('.vote');
  var $voteResult = $('.voteResult');

  // Both video must be present before the post is valid.
  var videoPresence = {
    'video-a': false,
    'video-b': false
  };

  var votes = post.collection('votes');
  console.log(votes);
  console.log(votes.getUserItem);
  var myVote = votes && votes.getUserItem && votes.getUserItem();

  // Define the post valid state given the current data.
  function validates() {
    post.valid(videoPresence['video-a'] && videoPresence['video-b']);
    console.log(videoPresence);
  }

  // The 2 video widgets needs to be displayed with
  // a 16:9 ratio.
  function resize() {
    window.console && console.log && console.log('Will resize');
    var w = $node.width(); // remove the votes button width
    var h = (w/16)*9;
    window.console && console.log && console.log(w, 'x', h);
    $video.width(w).height(h);
    post.size(2*h + 50); // 50 = Vote bar size
  }

  function handleVote(event) {
    event.preventDefault(true);
    if( post.context.player ) {
      var voteForKey = $(event.currentTarget).attr('href').substring(1);
      myVote = {
        'video-a': false,
        'video-b': false
      };
      myVote[voteForKey] = true;
      votes.setUserItem(myVote);
      post.save();
      printResult();
    }
  }

  // When a user click the score,
  // display a list of people that votes for it.
  function handleDisplayVoters(event) {
    event.preventDefault(true);
    event.stopPropagation(true); // Prevent a vote action.
    votes.find('recent', function(items){
      var videoName = $(event.currentTarget).closest('a').attr('href').substring(1);
      var selectedItems = [];
      for (var i = 0; i < items.length; i++) {
        if (items[i][videoName]) {
          selectedItems.push(items[i]);
        }
      }
      post.dialog('users', {items: selectedItems, title: "They voted for " + (videoName == 'video-a' ? 'A':'B')});
    });
  }

  // Print vote results.
  function printResult() {
    var scoreA = votes.count('video-a'),
        scoreB = votes.count('video-b');

    $voteLink.removeClass('winner').removeClass('looser').removeClass('equality');

    $('.video-a .voteResult').html(scoreA);
    $('.video-b .voteResult').html(scoreB);
    post.users('current', function display(user){
      if (myVote || post.isOwner(user)) {
        $voteResult.removeClass('hidden');
        if (scoreA > scoreB) {
          $('.video-a').addClass('winner');
          $('.video-b').addClass('looser');
        } else if (scoreB > scoreA) {
          $('.video-b').addClass('winner');
          $('.video-a').addClass('looser');
        } else {
          $('.video-a').addClass('equality');
          $('.video-b').addClass('equality');
        }
      }
    });
  }

  $voteLink.on('click', handleVote);
  $voteResult.on('click', handleDisplayVoters);

  if (myVote) {
    $voteResult.removeClass('hidden');
  }

  // Listen to resize events
  post.on('resize', resize());

  // Bootstrap
  resize();
  $video.utVideo()
    // Validates on change.
    .on('utVideo:change', function(event, newValue){
      videoPresence[event.target.id] = !!newValue;
      validates()
    });
  printResult();
});
