
function Resource(callback) {
    this.entries = {};
    this.loadCount = 0;
    this.callback = callback;
}


Resource.prototype.finished = function() {
  if (this.loadCount == 0)
    return true;
  else
    return false;
}


Resource.prototype.load = function(filename, callback) {
  var type = filename.substr(filename.lastIndexOf('.') + 1);
  this.entries[filename] = {
    filename: filename,
    type: type,
    loaded: false,
    content: null,
    callback: callback
  };

  this.loadCount++;

  var request = new XMLHttpRequest();
  request.onreadystatechange = this.onReadyStateChange.bind(this);
  request.open("GET", Resource.PATH + '/' + filename);
  request.send();
}


Resource.prototype.onReadyStateChange = function(event) {
  var request = event.target;
  if (request.readyState === XMLHttpRequest.DONE) {
    if (request.status === 200) {
      var filename = request.responseURL.substr(request.responseURL.lastIndexOf('/') + 1);
      this.entries[filename].content = request.responseText;
      this.entries[filename].loaded = true;
      this.loadCount--;
      if (this.callback) {
        this.callback(this.entries[filename]);
      }
    } else {
      console.log('There was a problem with the request.');
    }
  }
}



Resource.prototype.get = function(filename) {
  return this.entries[filename];
}


Resource.PATH = './resource';
