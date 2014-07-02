(function() {
  "use strict";

  var slice = Array.prototype.slice;

  function openFile(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function() {
      if (request.status === 200) {
        // Success, do nothing
      } else {
        // Error
        alert('Could not open file in editor: ' + request.responseText);
      }
    };

    request.onerror = function() {
      // There was a connection error of some sort
    };

    request.send();
  }

  var $ = function(selector) {
    return slice.call(document.querySelectorAll(selector));
  };

  // suboptimal since we aren't using event delegation, but it will do fine
  // for our use case
  $('.open-in-editor').forEach(function(el) {
    el.addEventListener('click', function(evt) {
      evt.preventDefault();

      openFile(el.getAttribute('href'));
    });
  });

}());
