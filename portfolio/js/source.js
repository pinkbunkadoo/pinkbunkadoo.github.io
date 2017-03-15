var info = {};

function selectItem(item) {
  // console.log(item);
  var name = item;

  if (name) {
    var image = new Image();
    image.src = name;
    image.onload = onImageLoad;
  }
}


function onImageLoad(e) {
  var image = e.target;
  var holder = document.getElementById('holder');
  holder.innerHTML = '';
  holder.appendChild(image);
  info.width = image.width;
  info.height = image.height;

  image.height = 320;
  // image.style.cursor = 'zoom-in';
  image.className = 'zoomin';
  image.onclick = onImageClick;
}


function onImageClick(e) {
  var holder = document.getElementById('holder');
  var image = new Image();
  image.src = e.target.src;

  if (e.target.height != info.height) {
    image.width = info.width;
    image.height = info.height;
    // image.style.cursor = 'zoom-out';
    image.className = 'zoomout';
  } else {
    image.height = 320;
    // image.style.cursor = 'zoom-in';
    image.className = 'zoomin';
  }

  image.onclick = onImageClick;
  holder.innerHTML = '';
  holder.appendChild(image);
}

