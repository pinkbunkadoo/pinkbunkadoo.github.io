
app = {};

app.WIDTH = '720px';
app.MARGIN = 16;
// app.HIGHLIGHT = 'rgba(160, 0, 255, 0.08)';
app.HIGHLIGHT = 'rgba(240, 200, 0, 0.1)';


app.init = function() {
  console.log('init');

  app.inventory = [];
  app.events = [];
  app.elements = {};

  var mainEl = document.createElement('div');
  mainEl.style.width = app.WIDTH;
  mainEl.style.marginLeft = 'auto';
  mainEl.style.marginRight = 'auto';
  mainEl.style.align = 'center';
  document.body.appendChild(mainEl);
  mainEl.style.paddingTop = '64px';
  app.elements.main = mainEl;

  app.elements.desc = document.createElement('div');
  app.elements.desc.className = 'content';
  app.elements.desc.style.paddingBottom = app.MARGIN + 'px';
  mainEl.appendChild(app.elements.desc);

  app.elements.ellipsis = document.createElement('div');
  app.elements.ellipsis.innerHTML = '...';
  app.elements.ellipsis.align = 'center';
  app.elements.ellipsis.style.display = 'none';
  app.elements.ellipsis.style.fontSize = '2em';
  mainEl.appendChild(app.elements.ellipsis);

  app.elements.mask = document.createElement('div');
  app.elements.mask.className = 'mask';
  app.elements.mask.style.display = 'none';
  app.elements.mask.addEventListener('click', app.maskClick);
  // app.elements.mask.addEventListener('dblclick', app.maskClick);
  // app.elements.mask.addEventListener('select', app.maskClick);
  document.body.appendChild(app.elements.mask);

  app.elements.message = document.createElement('div');
  app.elements.message.className = 'message';
  app.elements.message.style.position = 'relative';
  app.elements.message.style.display = 'none';
  app.elements.message.addEventListener('click', app.maskClick);

  mainEl.appendChild(app.elements.message);

  app.elements.popup = document.createElement('div');
  app.elements.popup.style.background = 'white';
  app.elements.popup.style.padding = '16px';
  app.elements.popup.style.boxShadow = '3px 4px 6px rgba(0, 0, 0, 0.4)';
  app.elements.popup.style.display = 'none';

  app.message = null;

  app.loadScene(app.firstScene);
}


app.loadScene = function(scene) {
  app.scene = app.scenes[scene];

  console.log('Scene', app.scene.title);

  if (app.scene.onEnter) {
    app.scene.onEnter(app.scene);
  }

  if (app.sequence == null) {
    app.refresh();
  }
}


app.refresh = function() {

  var el;
  app.elements.desc.innerHTML = '';

  if (app.scene.graphic) {
    el = document.createElement('div');
    el.align = 'center';
    var img = document.createElement('img');
    img.style.padding = '16px';
    img.src = 'images/' + app.scene.graphic;
    el.appendChild(img);
    app.elements.desc.appendChild(el);
  }

  if (app.scene.title) {
    el = document.createElement('div');
    el.className = 'title';
    el.align = 'center';
    el.innerHTML = app.scene.title.toUpperCase() + '.';
    app.elements.desc.appendChild(el);
  }

  var itemList = [];

  for (property in app.scene.snippets) {
    var snippet = app.scene.snippets[property];

    if (snippet.hidden != true) {
      var text = snippet.text;

      el = document.createElement('span');
      el.id = 'snippet:' + property;
      if (snippet.highlight) {
        el.style.backgroundColor = app.HIGHLIGHT;
        snippet.highlight = false;
      }

      var indices = [];

      var re = /(<[\w ]+>)/g;
      var matches = text.match(re);

      if (matches) {
        var offset = 0;
        for (var i = 0; i < matches.length; i++) {
          var index = text.indexOf(matches[i]);
          indices.push(index);

          var textNode = document.createTextNode(text.substr(offset, index - offset));
          el.appendChild(textNode);

          var temp = document.createElement('span');
          temp.id = 'item:' + snippet.items[i];
          temp.className = 'item';
          temp.style.whiteSpace = 'nowrap';
          temp.innerHTML = matches[i].substr(1, matches[i].length - 2);
          temp.addEventListener('click', app.interact);
          el.appendChild(temp);

          itemList.push(snippet.items[i]);

          offset = index + matches[i].length;
        }
        if (offset <= text.length-1) {
          el.appendChild(document.createTextNode(text.substr(offset)));
        }
      } else {
        el.appendChild(document.createTextNode(text));
      }

      app.elements.desc.appendChild(el);
    }
    app.elements.desc.appendChild(document.createTextNode(' '));
  }

  if (app.scene.items) {
    var keysBase = Object.keys(app.scene.items);
    var keys = [];

    for (var i = 0; i < keysBase.length; i++) {
      if (itemList.indexOf(keysBase[i]) > -1 || app.scene.items[keysBase[i]].hidden) {
      } else {
        keys.push(keysBase[i]);
      }
    }

    if (keys.length > 0) {
      app.elements.desc.appendChild(document.createTextNode('Other items of interest include'));

      for (var i = 0; i < keys.length; i++) {
        var temp = document.createElement('span');
        temp.id = 'item:' + keys[i];
        temp.className = 'item';
        temp.style.whiteSpace = 'nowrap';
        temp.innerHTML = app.scene.items[keys[i]].text;

        if (app.scene.items[keys[i]].highlight) {
          temp.style.backgroundColor = app.HIGHLIGHT;
          app.scene.items[keys[i]].highlight = false;
        }

        temp.addEventListener('click', app.interact);

        if (i > 0 && i < keys.length - 1)
          app.elements.desc.appendChild(document.createTextNode(', '));
        else if (i == 0)
          app.elements.desc.appendChild(document.createTextNode(' '));
        else
          app.elements.desc.appendChild(document.createTextNode(' and '));

        if (app.scene.items[keys[i]].unique != true) {
          if (app.scene.items[keys[i]].determiner)
            app.elements.desc.appendChild(document.createTextNode(app.scene.items[keys[i]].determiner + ' '));
          else
            app.elements.desc.appendChild(document.createTextNode('a '));
        }

        app.elements.desc.appendChild(temp);
      }
      app.elements.desc.appendChild(document.createTextNode('.'));
    }
  }

  if (app.message) {
    app.elements.mask.style.display = 'block';
    app.elements.mask.style.zIndex = 100;
    app.elements.mask.style.opacity = 0.5;

    app.elements.message.innerHTML = '';
    app.elements.message.style.display = 'block';
    app.elements.message.innerHTML = app.message;
    app.elements.message.style.zIndex = 600;
  }

  app.activeItemEl = null;
}


app.goScene = function(sceneId) {
  app.fadeScene = sceneId;
  app.elements.main.style.transition = 'opacity 0.5s';
  app.elements.main.addEventListener('transitionend', app.goSceneFadeComplete);
  app.elements.main.style.opacity = 0;
}


app.goSceneFadeComplete = function(event) {
  app.loadScene(app.fadeScene);
  app.elements.main.style.opacity = 1;
  app.fadeScene = null;
  event.target.removeEventListener('transitionend', app.goSceneFadeComplete);
}


app.end = function() {

}


app.mouseDown = function(event) {
}


app.mouseMove = function(event) {
}


app.refreshScene = function() {

}


app.interact = function(event) {
  var id = event.target.id;

  if (id == null || id == '') return;

  var temp = id.split(':');

  var popup = app.elements.popup;
  popup.innerHTML = null;

  var itemEl = event.target;

  app.activeItemEl = itemEl;

  var verbs = null;

  if (temp[0] == 'snippet') {
    // verbs = app.scene.snippets[temp[1]].entities[temp[2]].verbs;
  } else if (temp[0] == 'item') {
    verbs = app.scene.items[temp[1]].verbs;
  }

  for (property in verbs) {
    var verb = verbs[property];

    if (verb.hidden != true) {
      var el = document.createElement('div');
      if (temp[0] == 'snippet') {
        // el.id = temp[0] + ':' + temp[1] + ':' + temp[2] + ':' + property;
      } else if (temp[0] == 'item') {
        el.id = temp[0] + ':' + temp[1] + ':' + property;
      }
      el.className = 'verb';
      el.addEventListener('mousedown', app.verb);
      if (verb.text) {
        el.innerHTML = verb.text;
      } else {
        el.innerHTML = property;
      }
      popup.appendChild(el);
    }

  }

  if (app.scene.items[temp[1]].usecases) {
    var usecases = app.scene.items[temp[1]].usecases;
    var keys = [];
    var keyCandidates = Object.keys(usecases);

    for (var i = 0; i < keyCandidates.length; i++) {
      if (usecases[keyCandidates[i]].hidden != true) {
        keys.push(keyCandidates[i]);
      }
    }

    if (keys.length > 0) {
      var el = document.createElement('div');
      el.style.borderTop = '1px solid rgba(0, 0, 0, 0.8)';
      el.style.borderBottom = '1px solid rgba(0, 0, 0, 0.8)';
      el.style.background = 'lightgrey';
      popup.appendChild(el);

      for (var i = 0; i < keys.length; i++) {
        el = document.createElement('div');
        el.id = 'use' + ':' + temp[1] + ':' + keys[i];
        el.className = 'verb';
        el.addEventListener('mousedown', app.verb);
        el.innerHTML = keys[i];
        popup.appendChild(el);
      }
    }
  }

  app.showMask();

  popup.style.display = 'block';
  popup.style.position = 'absolute';

  popup.style.left = itemEl.offsetLeft + 'px';
  // console.log(itemEl.offsetLeft);

  popup.style.zIndex = 400;
  itemEl.style.backgroundColor = 'lightgray';

  itemEl.appendChild(popup);

  //
}


app.showMask = function() {
  app.elements.mask.style.display = 'block';
  app.elements.mask.style.opacity = 0;
  app.elements.mask.style.zIndex = 300;
}

app.hideMask = function() {
  app.elements.mask.style.display = 'none';
}


app.refreshInventory = function() {
}


app.addInventoryItem = function(name) {
  app.inventory.push(name);
  app.refreshInventory();
}


app.hideSnippet = function(id) {
  console.log('hideSnippet', id);
  var el = document.getElementById('snippet:' + id);
  el.style.textDecoration = 'line-through';
  el.style.transition = 'opacity 1s';
  el.style.opacity = 0;
  el.addEventListener('transitionend', app.hideSnippetComplete);
  app.scene.snippets[id].active = false;
}


app.hideSnippetComplete = function(event) {
  event.target.removeEventListener('transitionend', app.hideSnippetFinished);
  app.refresh();
}


app.displayMessage = function(text) {
  app.message = text;
}


app.playSequence = function(id) {
  if (app.scene.sequences) {
    if (app.scene.sequences[id]) {
      var sequence = app.scene.sequences[id];

      if (sequence.onBegin) {
        sequence.onBegin(app.scene);
      }

      app.sequence = sequence;
      app.sequenceIndex = -1;

      app.showMask();
      app.elements.ellipsis.style.display = 'block';

      app.elements.desc.innerHTML = '';
      app.advanceSequence();
    }
  }
}


app.advanceSequence = function() {
  app.sequenceIndex++;

  if (app.sequence.beats.length > app.sequenceIndex) {
    var el = document.createElement('div');
    // el.id = 'sequence_' + app.sequenceIndex;
    // el.className = 'content';
    el.className = 'sequence';
    if (app.sequenceIndex > 0) el.style.paddingTop = '1em';
    el.innerHTML = app.sequence.beats[app.sequenceIndex];
    app.elements.desc.appendChild(el);

    // el = document.getElementById('sequence_' + app.sequenceIndex);
    // el.style.opacity = 0.5;
    el.style.opacity = 0;
    el.style.transition = 'opacity 1s';
    el.style.opacity = 1;
  } else {
    // console.log('sequence end');
    if (app.sequence.onEnd) {
      app.sequence.onEnd(app.scene);
    }
    app.elements.ellipsis.style.display = 'none';
    app.sequence = null;
    app.sequenceIndex = null;
    app.hideMask();
  }
}


app.maskClick = function(event) {
  // event.preventDefault();
  // event.stopPropagation();
  // console.log('mask click');
  if (app.sequence) {
    app.advanceSequence();
  } else {
    app.elements.mask.style.display = 'none';
    app.elements.popup.style.display = 'none';
    if (app.message) {
      app.message = null;
      app.elements.message.style.display = 'none';
    }
    if (app.activeItemEl) {
      app.activeItemEl.style.backgroundColor = 'white';
      app.activeItemEl = null;
    }
  }
}


app.verb = function(event) {
  console.log('verb', event.target.id)

  var id = event.target.id;

  app.hideVerbs();

  var temp = id.split(':');

  if (temp[0] == 'item') {
    var item = app.scene.items[temp[1]];
    var handler = item.verbs[temp[2]].handler;
    handler(item);
  } else if (temp[0] == 'snippet') {
    // var snippet = app.scene.snippets[temp[1]];
    // var handler = snippet.entities[temp[2]].verbs[temp[3]].handler;
    // handler();
  } else if (temp[0] == 'use') {
    var item = app.scene.items[temp[1]];
    var handler = app.scene.items[temp[1]].usecases[temp[2]].handler;
    handler(item);
  }


  app.refresh();
}


app.hideVerbs = function() {
  app.elements.mask.style.display = 'none';
  app.elements.popup.style.display = 'none';
}
