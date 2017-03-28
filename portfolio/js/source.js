var info = {};
var images = {};
var previews = {};

var items = [ 'harry', 'hermione', 'ginny', 'bellatrix', 'mayday', 'monk', 'bernard', 'fiat' ];

function preloadImages() {
  for (var i = 0; i < items.length; i++) {
    var name = items[i];
    var image = new Image();
    image.id = name;
    image.src = './images/preview_' + name + '.jpg';
    image.className = 'zoomin';
    image.onclick = onImageClick;
    previews[name] = image;
  }
}

function selectItem(name) {
  if (name) {
    holder.innerHTML = '';
    holder.appendChild(previews[name]);

    if (!images[name]) {
      images[name] = new Image();
      images[name].id = name;
      images[name].className = 'zoomout';
      images[name].src = './images/' + name + '.jpg';
      images[name].onclick = onImageClick;
    }
  }
}


function onImageLoad(e) {
  // var image = e.target;
  // var holder = document.getElementById('holder');
  // holder.innerHTML = '';
  // holder.appendChild(image);
}


function onImageClick(e) {
  var holder = document.getElementById('holder');
  var id = e.target.id;

  holder.innerHTML = '';

  if (e.target.className == 'zoomin') {
    holder.appendChild(images[id]);
  } else {
    holder.appendChild(previews[id]);
  }
}


preloadImages();

