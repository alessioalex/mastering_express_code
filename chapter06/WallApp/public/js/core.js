$(function() {
  var $newPost = $('#new-post-content');
  var $postsContainer = $('#posts');
  var $postsHeading = $postsContainer.find('h3');
  var $charCounter = $('#char-counter');
  var $postUpdatesBanner = $('#post-updates');
  var $postCounter = $postUpdatesBanner.find('.post-counter');

  var displayRemainingChars = function(evt) {
    var total = 255;
    var written = $newPost.val().length;

    $charCounter.text(total - written);
  };

  $newPost.on('keyup', displayRemainingChars);

  var detectBottom = function(cb) {
    $(window).scroll(function() {
      if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10) {
        // no need to execute cb() multiple times, so we unbind the handler
        $(window).unbind('scroll');
        cb();
      }
    });
  }

  var insertPosts = function(existingPosts, html) {
    var $newPosts = $('<div id="newPosts">' + html + '</div>');

    // remove the posts that are already in the DOM
    // (because creation date <= to the last post)
    $newPosts.find('.post').each(function() {
      var thisEl = $(this);
      var id = thisEl.attr('data-id');

      if (existingPosts.indexOf(id) !== -1) {
        thisEl.remove();
      }
    });

    var newPostsHtml = $.trim($newPosts.html());

    if (newPostsHtml !== '') {
      $postsContainer.append(newPostsHtml);
      // rebind the handler to the scroll now that we've fetched the data
      detectBottom(loadMore);
    }
  };

  var displayLoadingMessage = function() {
    var loadingItem = $('<div class="loading">Loading older posts, please wait...</div>');
    loadingItem.appendTo($postsContainer);
  };

  var removeLoadingMessage = function() {
    $('.loading').remove();
  };

  var displayLoadingError = function() {
    $('<p>Something bad happend :-(</p>').appendTo($postsContainer);
  };

  var loadMore = function() {
    displayLoadingMessage();

    var olderThan = $postsContainer.find('.post:last').attr('data-timestamp');
    var existingPosts = [];

    $postsContainer.find('.post').each(function() {
      existingPosts.push($(this).attr('data-id'));
    });

    // search for posts that are older than (or eqal to) the last post
    if (olderThan) {
      $.ajax({
        url: '/?partial=1&older=' + olderThan
      })
      .done(insertPosts.bind(null, existingPosts))
      .fail(displayLoadingError)
      .always(removeLoadingMessage);
    }
  };

  detectBottom(loadMore);

  var incomingPosts = [];

  var displayPostUpdates = function(evt) {
    evt.preventDefault();

    // display from newest to oldest
    var html = '';
    var current = incomingPosts.length - 1;
    while (current >= 0) {
      html += incomingPosts[current];
      current--;
    }

    $(html).insertAfter($postsHeading);
    $postUpdatesBanner.fadeOut();
  };

  $postUpdatesBanner.on('click', 'a', displayPostUpdates);

  // establish realtime connections only for the main page
  if (document.location.pathname === '/') {
    var primus = new Primus();

    primus.on('open', function open() {
      console.log('Primus Open', 'The connection has been established.');
    });

    primus.on('error', function error(err) {
      console.error('Primus Erorr', 'An unknown error has occured <code>'+ err.message +'</code>');
    });

    primus.on('data', function incoming(data) {
      console.log('Primus Data', data);

      incomingPosts.push(data);
      $postCounter.text(incomingPosts.length);
      $postUpdatesBanner.fadeIn();
    });
  }
});
