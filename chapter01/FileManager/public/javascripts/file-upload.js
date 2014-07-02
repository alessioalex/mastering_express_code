$(function() {
  var file = {
    name: '',
    size: 0
  };
  var uploadForm = $('#upload-form');
  var fakeUploadBox = $('#fake-upload-box');
  var fileInput = uploadForm.find('input[type=file]');

  function isValidFileName(name) {
    return /[a-z0-9_]/i.test(name);
  }

  fileInput.on('change', function(evt) {
    var el = $(this);
    // get the filename, work for unix && windows
    file.name = el.val().split(/(\\|\/)/g).pop();

    if (evt.target.files) {
      // convert to kb
      file.size = (evt.target.files[0].size / 1024).toFixed(2);
    }

    if (!isValidFileName(file.name)) {
      alert('Bad file name! a-z, 0-9 && underscore allowed only!');
      el.val('');
    } else {
      fakeUploadBox.val(file.name);
    }
  });

});
