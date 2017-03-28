var info = {};

var images = {};
var previews = {};

function selectItem(item) {
  var name = item;

  if (name) {
    var image = new Image();
    image.id = item;
    image.src = './images/preview_' + name + '.jpg';
    image.className = 'zoomin';
    image.onload = onImageLoad;
    image.onclick = onImageClick;
    previews[item] = image;

    images[item] = new Image();
    images[item].id = item;
    images[item].className = 'zoomout';
    images[item].src = './images/' + name + '.jpg';
    images[item].onclick = onImageClick;
  }
}


function onImageLoad(e) {
  var image = e.target;
  var holder = document.getElementById('holder');
  holder.innerHTML = '';
  holder.appendChild(image);
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

