
var Engine = {};
var Time = {};

MESHES = [ 'level01.obj', 'level02.obj', 'cube.obj', 'cone.obj', 'ico.obj', 'marker.obj' ];
TEXTURES = [ ];

Engine.createElements = function() {
  document.body.style.backgroundColor = 'rgb(0, 0, 0)';

  Engine.fpsEl = document.createElement('div');
  Engine.fpsEl.style.color = 'white';
  document.body.appendChild(Engine.fpsEl);

  Engine.stage = document.createElement('div');
  Engine.stage.id = 'stage';
  Engine.stage.style.position = 'absolute';
  Engine.stage.style.overflow = 'hidden';
  Engine.stage.style.top = '50%';
  Engine.stage.style.left = '50%';
  Engine.stage.style.width = Engine.width + 'px';
  Engine.stage.style.height = (Engine.height) + 'px';
  Engine.stage.style.margin = '-' + (Engine.height / 2) + 'px 0 0 -' + (Engine.width / 2) + 'px';
  Engine.stage.style.userSelect = 'none';
  Engine.stage.style.padding = '0px';
  Engine.stage.style.border = '0px';
  Engine.stage.style.fontSize = '0';
  document.body.appendChild(Engine.stage);

  Engine.canvas = document.createElement('canvas');
  Engine.canvas.style.backgroundColor = 'green';
  Engine.canvas.id = 'surface';
  Engine.canvas.width = Engine.width;
  Engine.canvas.height = Engine.height;
  Engine.canvas.style.userSelect = 'none';
  Engine.stage.appendChild(Engine.canvas);

  Engine.context = Engine.canvas.getContext('2d');

  Engine.offscreenCanvas = document.createElement('canvas');
  Engine.offscreenCanvas.width = Engine.offscreenWidth;
  Engine.offscreenCanvas.height = Engine.offscreenHeight;

  Engine.offscreenContext = Engine.offscreenCanvas.getContext('2d');

  Engine.context.mozImageSmoothingEnabled = false;
  Engine.context.webkitImageSmoothingEnabled = false;
  Engine.context.msImageSmoothingEnabled = false;
  Engine.context.imageSmoothingEnabled = false;
}


Engine.onResourceLoad = function(filename) {
  // console.log('Engine.onResourceLoad', filename);
  var res = Resource.get(filename);
  if (res.type == 'obj') {
    Engine.meshes[filename] = Mesh.fromOBJ(res);
  } else if (res.type == 'png') {
    // console.log('Texture loaded');
    Engine.textures[filename] = Texture.fromImage(res.content);
  }
  if (Resource.done) {
    Engine.bootup();
  }
}


Engine.loadResources = function() {
  Resource.init(Engine.onResourceLoad);
  for (var i = 0; i < MESHES.length; i++) {
    Resource.load(MESHES[i]);
  }

  for (var i = 0; i < TEXTURES.length; i++) {
    Resource.load(TEXTURES[i]);
  }
}


Engine.init = function(width, height, scale) {
  console.log('init');

  Engine.fps = {};
  Engine.fps.standard = 60;

  Engine.interact = {};
  Engine.keys = {};
  Engine.entities = [];
  Engine.lines = [];
  Engine.transitions = [];

  Engine.scale = (scale !== undefined ? scale : 1);

  Engine.width = width;
  Engine.height = height;

  Engine.offscreenWidth = Engine.width * Engine.scale;
  Engine.offscreenHeight = Engine.height * Engine.scale;

  Engine.meshes = {};
  Engine.textures = {};
  // Engine.surfaceObjectLookup = new Array(Engine.width * Engine.height);

  Engine.createElements();
  Engine.initEventListeners();
  Engine.loadResources();
  // Engine.bootup();
}


// console.log(map(70, 0, 1000, 0, 255));


Engine.loadLevel = function(index) {
  Engine.level = Engine.levels[index];
  Engine.grid = Engine.level.grid;
}


Engine.processLevelMesh = function(level) {
  var mesh = level.mesh;
  var grid = level.grid = new Array(16 * 16);
  var tt = 0;

  mesh.colors.push(new Color(230, 230, 230, 255));
  mesh.colors.push(new Color(190, 200, 200, 255));
  var color_1 = mesh.colors.length - 2;
  var color_2 = mesh.colors.length - 1;

  for (var i = 0; i < mesh.triangles.length; i++) {
    var triangle = mesh.triangles[i];
    var color = new Color(255, 255, 255);

    var v0 = mesh.vertices[triangle.vertices[0]];
    var v1 = mesh.vertices[triangle.vertices[1]];
    var v2 = mesh.vertices[triangle.vertices[2]];

    var d0 = distance(v0.x, v0.z, v1.x, v1.z);
    var d1 = distance(v0.x, v0.z, v2.x, v2.z);
    var d2 = distance(v1.x, v1.z, v2.x, v2.z);

    if (d0 != 0 && d1 != 0 && d2 != 0) {
      tt++;

      var max = Math.max(d0, d1, d2);
      var mp = new Vector();

      if (d0 == max) {
        mp.x = (v0.x + v1.x) / 2;
        mp.y = (v0.z + v1.z) / 2;
      } else if (d1 == max) {
        mp.x = (v0.x + v2.x) / 2;
        mp.y = (v0.z + v2.z) / 2;
      } else if (d2 == max) {
        mp.x = (v1.x + v2.x) / 2;
        mp.y = (v1.z + v2.z) / 2;
      }

      mp.x = mp.x - 0.5 + 8;
      mp.y = mp.y - 0.5 + 8;


      triangle.id = (mp.y * 16 + mp.x) + 1;
      var index = triangle.id - 1;

      if (Color.equals(mesh.colors[triangle.colors[0]], Color.GREY)) {
        if ((mp.y % 2 == 0 && mp.x % 2 == 0) || (mp.y % 2 != 0 && mp.x % 2 != 0)) {
          triangle.colors[0] = color_2;
          triangle.colors[1] = color_2;
          triangle.colors[2] = color_2;
        } else {
          triangle.colors[0] = color_1;
          triangle.colors[1] = color_1;
          triangle.colors[2] = color_1;
        }
        grid[index] = { height: v0.y, color: color };
      } else {
        color = mesh.colors[triangle.colors[0]];
        if (grid[index] ==  undefined) {
          grid[index] = { height: v0.y, color: color };
        } else {
          if (grid[index].height > v0.y) {
            grid[index] = { height: v0.y, color: color };
          }
        }
      }

    }
  }
}


Engine.createWorld = function() {
  // console.log('Engine.createWorld');

  Engine.imageData = Engine.offscreenContext.getImageData(0, 0, Engine.offscreenWidth, Engine.offscreenHeight);
  var surface = new Surface(Engine.offscreenWidth, Engine.offscreenHeight, Engine.imageData);

  var camera = new Camera(Camera.PERSPECTIVE, 30, 0.1, 100);
  // var camera = new Camera(Camera.ORTHOGRAPHIC);
  camera.transform.position.x = 32;
  camera.transform.position.y = 32;
  camera.transform.position.z = 32;
  camera.orthoScale = 0.05;
  // camera.transform.rotation.x = -45 * RAD;
  // camera.orientation = Camera.lookAt(camera.transform.position, new Vector(), new Vector(0, 1, 0));
  camera.lookAt(camera.transform.position, new Vector(), new Vector(0, 1, 0));
  // console.log(camera.xaxis, camera.yaxis, camera.zaxis);

  var view = new View(0, 0, surface.width, surface.height, camera);

  Renderer.init(surface, view);

  Engine.grid = new Array(16 * 16);

  Engine.light = new Light(0, 0, 0, new Color(255, 255, 255, 255));
  Engine.light.setDirection(-0.4, -1, -0.6);
  // Engine.light.setDirection(0.5, -1, -0.75);

  Engine.lightFill = new Light(0, 0, 0, new Color(128, 140, 160, 255));
  Engine.lightFill.setDirection(0.4, 0, 0.6);
  // Engine.lightFill.setDirection(-1, 0, 0.75);

  Engine.levels = [];

  var level01 = new Entity();
  level01.mesh = Engine.meshes['level01.obj'];
  level01.exit = 16;
  // level.ao = Engine.textures['ao.png'];
  Engine.processLevelMesh(level01);
  Engine.levels.push(level01);

  var level02 = new Entity();
  level02.mesh = Engine.meshes['level02.obj'];
  level02.exit = 207;
  // level.ao = Engine.textures['ao.png'];
  Engine.processLevelMesh(level02);
  Engine.levels.push(level02);
  // Engine.level = level01;

  level01.other = 1;
  level02.other = 0;

  var cube = new Entity(0.5, 0.5, 0.5);
  cube.mesh = Engine.meshes['cube.obj'];
  // cube.texture = Engine.textures['cube.png'];
  cube.ambient = 0.4;
  cube.tint = new Colorf(1, 1, 1);
  Engine.cube = cube;

  // Engine.cursor = new Entity(0, 0, 0);

  // Engine.cursor.lines = [
  //   new Line(new Vector(-0.5, 0.5, 0.5), new Vector(0.5, 0.5, 0.5)),
  // ];

  var marker = new Entity(0.5, Engine.cube.transform.position.y + 1, 0.5);
  marker.mesh = Engine.meshes['marker.obj'];
  marker.ambient = 0.8;
  Engine.marker = marker;

  // var timer = new Timer({id : 'marker', duration: 1s }, );
  // Engine.timers['marker'] = timer;

  var transition = new Transition({ duration: 500, startValue: 1, endValue: 1.2, object: marker.transform.position, property: 'y', bounce: true, repeat: true });
  Engine.transitions['marker'] = transition;

  Engine.gridId = 0;

  // var cone = new Entity(0, 0, 0);
  // cone.mesh = Engine.meshes['cone.obj'];
  // Engine.entities.push(cone);
  // Engine.cone = cone;
  //
  // var ico = new Entity(2, 2, 0);
  // ico.mesh = Engine.meshes['ico.obj'];
  // Engine.ico = ico;
  // Engine.entities.push(ico);

  // var plane = new Entity(0, 0, 0);
  // plane.mesh = Engine.meshes['plane.obj'];
  // plane.texture = Engine.textures['cube.png'];
  // Engine.entities.push(plane);

  // var compass = new Entity(0.5, 0.5, 0.5);
  // compass.mesh = Engine.meshes['compass.obj'];
  // compass.ambient = 1.0;
  // Engine.entities.push(compass);
  // Engine.compass = compass;

  // Engine.lines.push(new Line(new Vector(0, 0, 0), new Vector(2, 0, 0), Color.RED));
  // Engine.lines.push(new Line(new Vector(0, 0, 0), new Vector(0, 2, 0), Color.GREEN));
  // Engine.lines.push(new Line(new Vector(0, 0, 0), new Vector(0, 0, 2), Color.BLUE));

  Engine.loadLevel(0);
}


Engine.bootup = function() {
  Engine.createWorld();
  Engine.initialised = true;
  Engine.first = true;
  Time.start = performance.now();
  Engine.resume();
}


Engine.resume = function() {
  if (Engine.initialised) {

    Engine.active = true;
    Time.now = performance.now();
    Time.then = Time.now;
    Time.count = 0;
    Engine.fps.average = Engine.fps.standard;
    Engine.frameID = requestAnimationFrame(Engine.frame);

    for (i in Engine.transitions) {
      Engine.transitions[i].start();
    }

  }
}


Engine.stop = function() {
  Engine.active = false;
  cancelAnimationFrame(Engine.frameID);

  for (i in Engine.transitions) {
    Engine.transitions[i].stop();
  }

  var ctx = Engine.context;
  var x = Engine.width - 10, y = 4;
  ctx.fillStyle ='white';
  ctx.fillRect(x, y, 2, 6);
  ctx.fillRect(x + 4, y, 2, 6);
}


Engine.updateTransitions = function() {
  for (i in Engine.transitions) {
    Engine.transitions[i].update();
  }
}


Engine.update = function() {
  var camera = Renderer.view.camera;
  var center = new Vector();
  var axis = new Vector(0, 1, 0);
  var delta = Time.delta;

  if (Engine.keys['ArrowLeft']) {
  }

  if (Engine.keys['ArrowRight']) {
  }

  if (Engine.keys['ArrowUp']) {
    camera.transform.position.y--;
    camera.orientation = Camera.lookAt(camera.transform.position, new Vector(), new Vector(0, 1, 0));
  }

  if (Engine.keys['ArrowDown']) {
    camera.transform.position.y++;
    camera.orientation = Camera.lookAt(camera.transform.position, new Vector(), new Vector(0, 1, 0));
  }

  if (Engine.keys['+']) {
    Engine.entities[0].transform.position.z += 5 * delta;
  }

  if (Engine.keys['-']) {
    Engine.entities[0].transform.position.z -= 5 * delta;
  }

  if (Engine.ico) {
    var angle = (1 * delta);
    Engine.ico.transform.rotateAround(center, (new Vector(0, 1, 0)).normalize(), angle);
  }

  if (Engine.compass) {
    if (Engine.compass.transform.scale.x >= 1.5) Engine.compass.transform.scale.x = 1;
    if (Engine.compass.transform.scale.z >= 1.5) Engine.compass.transform.scale.z = 1;
    Engine.compass.transform.scale.x += 0.01;
    Engine.compass.transform.scale.z += 0.01;
  }

  if (Engine.cube) {
    // Engine.cube.ambient -= 0.004;
    // if (Engine.cube.ambient <= 0.4) Engine.cube.ambient = 0.6;

    if (Time.count % 8 == 0) Engine.cube.tint.r = Math.max(0.2, Math.random());
    // Engine.cube.tint.g  = Math.random();
    // Engine.cube.tint.b  = Math.random();
  }

  // Engine.cone.transform.rotation.y += angle;
  // Engine.cone.transform.rotation.z += theta;

  if (Engine.interact.primary) {
    var angle = -(Engine.interact.deltaX) * 0.01 * delta;
    Renderer.view.camera.transform.rotateAround(center, axis, angle);
    camera.orientation = Camera.lookAt(camera.transform.position, new Vector(), new Vector(0, 1, 0));
  }

  // var angle = -(Engine.interact.deltaX * 10) * delta;
  // Renderer.view.camera.transform.rotateAround(center, axis, 10 * delta);
  // camera.orientation = Camera.lookAt(camera.transform.position, new Vector(), new Vector(0, 1, 0));

}


Engine.frame = function(timestamp) {
  if (Engine.active && Resource.done) {
    // var interval = 1000 / Engine.fps.standard;
    Time.now = performance.now();
    // Time.now = timestamp;
    Time.delta = 1000 / (Time.now - Time.then);

    // if (Time.delta >= interval) {
      Engine.update();
      Engine.updateTransitions();
      Engine.draw();

      // Time.then = Time.now - (Time.delta % interval);
      Engine.fps.average = Engine.fps.average * 0.99 + Time.delta * 0.01;
    // }

    Time.count++;

    if (Time.count % Engine.fps.standard == 0) {
      Engine.fpsEl.innerHTML = Engine.fps.standard;
    }

    Time.then = Time.now;
    Engine.frameID = requestAnimationFrame(Engine.frame);

    Engine.first = false;
  }
  // Engine.keys = {};
  Engine.interact.primaryUp = false;
  Engine.interact.deltaX = 0;
  Engine.interact.deltaY = 0;
}


Engine.drawEntity = function(entity, cull) {
  var camera = Renderer.view.camera;

  if (entity.mesh) {
    var mesh = entity.mesh;
    var texture = entity.texture;
    var ambient = (entity.ambient !== undefined ? entity.ambient : 0);
    var tint = (entity.tint !== undefined ? entity.tint : new Colorf(1, 1, 1));
    var ao = entity.ao;
    var view = camera.getTransformMatrix().inverse();
    var model = entity.getTransformMatrix();
    var rotationMatrix = entity.getRotationMatrix();
    var lightNormal = (Vector.scale(Engine.light.direction, -1));
    var lightFillNormal = (Vector.scale(Engine.lightFill.direction, -1));
    var lightColor = Colorf.fromColor(Engine.light.color);
    var lightFillColor = Colorf.fromColor(Engine.lightFill.color);
    // var cameraNormal = new Vector(camera.transform.x, camera.transform.y, camera.transform.z);
    // var projection = Camera.perspectiveFOV(camera.fov, Renderer.aspect, camera.near, camera.far);
    var triangle;
    var backface;
    var n, v0, v1, v2;
    var facingRatio0, facingRatio1;
    var illumination = new Color();
    var id;

    if (mesh.vert_calc === undefined) {
      mesh.vert_calc = new Array(mesh.vertices.length);
    }

    for (var i = 0; i < mesh.vertices.length; i++) {
      mesh.vert_calc[i] = model.multiplyPoint(mesh.vertices[i]);
    }

    for (var i = 0; i < mesh.triangles.length; i++) {
      triangle = mesh.triangles[i];
      id = (triangle.id !== undefined ? triangle.id : 0);

      v0 = mesh.vert_calc[triangle.vertices[0]];
      v1 = mesh.vert_calc[triangle.vertices[1]];
      v2 = mesh.vert_calc[triangle.vertices[2]];

      // backface = Vector.dot(n, cameraNormal);

      v0 = Renderer.projectPoint(v0, view);
      v1 = Renderer.projectPoint(v1, view);
      v2 = Renderer.projectPoint(v2, view);

      backface = (v0.x * v1.y - v1.x * v0.y) + (v1.x * v2.y - v2.x * v1.y) + (v2.x * v0.y - v0.x * v2.y);

      if (backface > 0) {
        v0 = Renderer.screenToRaster(v0);
        v1 = Renderer.screenToRaster(v1);
        v2 = Renderer.screenToRaster(v2);

        n = (rotationMatrix.multiplyPoint(triangle.normal)).normalize();

        facingRatio0 = Math.max(0, Vector.dot(n, lightNormal));
        facingRatio1 = Math.max(0, Vector.dot(n, lightFillNormal));

        illumination.r = Math.min(1.0, facingRatio0 * lightColor.r + facingRatio1 * lightFillColor.r);
        illumination.g = Math.min(1.0, facingRatio0 * lightColor.g + facingRatio1 * lightFillColor.g);
        illumination.b = Math.min(1.0, facingRatio0 * lightColor.b + facingRatio1 * lightFillColor.b);

        illumination.r = Math.min(1.0, illumination.r + ambient);
        illumination.g = Math.min(1.0, illumination.g + ambient);
        illumination.b = Math.min(1.0, illumination.b + ambient);

        v0.color = Color.copy(mesh.colors[triangle.colors[0]]);
        v1.color = Color.copy(mesh.colors[triangle.colors[1]]);
        v2.color = Color.copy(mesh.colors[triangle.colors[2]]);

        if (triangle.uvs.length > 0) {
          v0.uv = mesh.uvs[triangle.uvs[0]];
          v1.uv = mesh.uvs[triangle.uvs[1]];
          v2.uv = mesh.uvs[triangle.uvs[2]];
        }

        if ((v0.z > 0.1 && v1.z > 0.1 && v2.z > 0.1)) {
          Renderer.drawTriangle(v0, v1, v2, illumination, tint, texture, id);
        }
      }
    }
  }
}


Engine.drawEntityAxes = function(entity) {
  // var transformMatrix = entity.getTransformMatrix();
  var xaxis, yaxis, zaxis, line;

  zaxis = new Vector(0, 0, 2);
  var a = entity.toWorld(zaxis);
  line = new Line(entity.transform.position, a, Color.BLUE);
  Renderer.drawLine(line);

  yaxis = new Vector(0, 2, 0);
  var b = entity.toWorld(yaxis);
  line = new Line(entity.transform.position, b, Color.GREEN);
  Renderer.drawLine(line);

  xaxis = new Vector(2, 0, 0);
  var c = entity.toWorld(xaxis);
  line = new Line(entity.transform.position, c, Color.RED);
  Renderer.drawLine(line);

}


Engine.isValidMove = function(g) {
  var x = (g % 16);
  var y = Engine.grid[g].height;
  var z = ((g / 16) >> 0);

  var position = Engine.cube.transform.position;
  var cubex = position.x + 7.5, cubez = position.z + 7.5;

  if (x == cubex) {
    if (z >= cubez) {
      for (var i = cubez; i <= z; i++) if (Engine.grid[i * 16 + x].height != position.y - 0.5) return false;
      return true;
    } else {
      for (var i = cubez; i >= z; i--) if (Engine.grid[i * 16 + x].height != position.y - 0.5) return false;
      return true;
    }
  } else if (z == cubez) {
    if (x >= cubex) {
      for (var i = cubex; i <= x; i++) if (Engine.grid[z * 16 + i].height != position.y - 0.5) return false;
      return true;
    } else {
      for (var i = cubex; i >= x; i--) {
        if (Engine.grid[z * 16 + i].height != position.y - 0.5) {
          // console.log(i, cubex, x, z);
          return false;
        }
      }
      return true;
    }
  }
  return false;
}


Engine.drawEntities = function() {
  if (Engine.level) {
    Engine.drawEntity(Engine.level);
  }

  if (Engine.cube) {
    Engine.drawEntity(Engine.cube);
  }

  if (Engine.marker) {
    Engine.drawEntity(Engine.marker);
  }

  for (var i = 0; i < Engine.entities.length; i++) {
    Engine.drawEntity(Engine.entities[i], false);
  }

  // for (var i = 0; i < Engine.lines.length; i++) {
  //   Renderer.drawLine(Engine.lines[i], Color.WHITE);
  // }
  //
  // for (var i = 0; i < Engine.entities.length; i++) {
  //   Engine.drawEntityAxes(Engine.entities[i]);
  // }
  //

  if (Engine.gridId > 0 && ! Engine.interact.drag) {
    var position = Engine.cube.transform.position;
    var g = Engine.gridId - 1;
    var x = (g % 16) - 7;
    var y = Engine.grid[g].height;
    var z = ((g / 16) >> 0) - 7;
    var color;
    var valid = Engine.isValidMove(g);

    if (valid)
      color = Color.GREEN;
    else
      color = Color.RED;

    var line1 = new Line(new Vector(x - 1, y, z), new Vector(x, y, z), color);
    var line2 = new Line(new Vector(x - 1, y, z - 1), new Vector(x, y, z - 1), color);
    var line3 = new Line(new Vector(x - 1, y, z), new Vector(x - 1, y, z - 1), color);
    var line4 = new Line(new Vector(x, y, z), new Vector(x, y, z - 1), color);
    Renderer.drawLine(line1);
    Renderer.drawLine(line2);
    Renderer.drawLine(line3);
    Renderer.drawLine(line4);

    if (valid) {
      // if (position.y == Engine.grid[g] + 0.5) {
        var linepath = new Line(position, new Vector(x - 0.5, y, z - 0.5), Color.YELLOW);
        Renderer.drawLine(linepath);
      // }
    }
  }
}


Engine.drawTest = function() {
  var surface = Renderer.surface;
  var view = Renderer.view;
  // var transform = Engine.level.getTransformMatrix();


  var shade = new Colorf();

  for (var i = 0; i < 100; i++) {
    var r = Math.random();
    var s = Math.random();
    var t = (160 * r) + 10 >> 0;
    var u = (100 * s) + 10 >> 0;
    var w = 8;

    var v0 = new Vector(t, u, 1+r);
    var v1 = new Vector(t + w, u, 1+r);
    var v2 = new Vector(t + w, u - w, 1+r);

    v0.color = new Color((Math.random()*255), (Math.random()*255), (Math.random()*255));

    Renderer.drawTriangle(v0, v1, v2, shade);
  }

}


Engine.swapBuffer = function() {
  // Engine.imageData.data.set(Renderer.surface.buf8);
  // Engine.imageData.data.set(Renderer.surface.buf32);
  Engine.offscreenContext.putImageData(Engine.imageData, 0, 0);
  Engine.context.drawImage(Engine.offscreenCanvas, 0, 0, Engine.width, Engine.height);
  // Engine.context.putImageData(Engine.imageData, 0, 0);
}


Engine.drawOverlay = function() {
  var ctx = Engine.context;

  ctx.fillStyle = 'rgb(0, 255, 0)';
  ctx.fillText(Math.round(Engine.fps.average), 10, 20);

  ctx.fillStyle = 'rgb(0, 255, 0)';
  ctx.fillText(Renderer.tricount, 10, 30);

  ctx.fillStyle = 'rgb(0, 255, 0)';
  ctx.fillText(Renderer.largetri, 10, 40);
}


Engine.draw = function() {
  var ctx = Engine.context;

  ctx.fillStyle = 'rgb(32, 32, 64)';
  ctx.fillRect(0, 0, Engine.width, Engine.height);

  Engine.offscreenContext.fillStyle = 'darkgreen';
  Engine.offscreenContext.fillRect(0, 0, Engine.offscreenWidth, Engine.offscreenHeight);

  Renderer.reset();
  Renderer.surface.clear();

  Engine.drawEntities();
  // Engine.drawTest();
  Engine.swapBuffer();

  Engine.drawOverlay();

}


Engine.onBlur = function(event) {
  Engine.stop();
}


Engine.onFocus = function(event) {
  Engine.resume();
}


Engine.keyTimeout  = function(key) {
}


Engine.onContextMenu = function(event) {
  event.preventDefault();
}


Engine.onScroll = function(event) {
  event.preventDefault();
  // console.log('scroll');
}


Engine.onKeyDown = function(event) {
  Engine.keys[event.key] = true;
}


Engine.onKeyUp = function(event) {
  delete(Engine.keys[event.key]);
}


Engine.beginInteraction = function() {
  var point = new Vector(Engine.interact.x, Engine.interact.y, 0);
}


Engine.updateInteraction = function() {

  var gx = (Engine.interact.x * Engine.scale) >> 0;
  var gy = (Engine.interact.y * Engine.scale) >> 0;
  var id = Renderer.idBuffer[gy * Renderer.surface.width + gx];

  var distance = Math.abs(Engine.interact.startX - Engine.interact.x) + Math.abs(Engine.interact.startY - Engine.interact.y);
  if (Engine.interact.primary && distance > 3) {
    Engine.interact.drag = true;
  }

  Engine.gridId = id;
}


Engine.moveTo = function(g) {
  var position = Engine.cube.transform.position;
  var x = (g % 16) - 7;
  var y = Engine.grid[g].height;
  var z = ((g / 16) >> 0) - 7;

  position.x = x - 0.5;
  position.z = z - 0.5;
  position.y = y + 0.5;

  Engine.marker.transform.position.x = position.x;
  Engine.marker.transform.position.z = position.z;

  Engine.transitions['marker'].stop();
  var transition = new Transition({ duration: 500, startValue: position.y + 1, endValue: position.y + 1.2, object: Engine.marker.transform.position, property: 'y', bounce: true, repeat: true });
  Engine.transitions['marker'] = transition;
  transition.start();
}


Engine.endInteraction = function() {
  // console.log('end', Engine.interact.button);
  var point = new Vector(Engine.interact.x, Engine.interact.y, 0);

  var d = Math.abs(Engine.interact.startX - Engine.interact.x) + Math.abs(Engine.interact.startY - Engine.interact.y);

  var x = (point.x * Engine.scale) >> 0;
  var y = (point.y * Engine.scale) >> 0;
  var id = Renderer.idBuffer[y * Renderer.surface.width + x];

  Engine.gridId = id;

  if (Engine.interact.drag == false) {

    if (Engine.gridId > 0) {
      var position = Engine.cube.transform.position;
      var g = Engine.gridId - 1;
      var x = (g % 16) - 7;
      var y = Engine.grid[g].height;
      var z = ((g / 16) >> 0) - 7;

      if (Engine.isValidMove(g)) {

        if (Engine.level.exit == g) {
          // console.log('win');
          Engine.loadLevel(Engine.level.other)
          Engine.moveTo(Engine.level.exit);
        } else {

          // if (Engine.compass) {
          //   Engine.compass.transform.position.x = x - 0.5;
          //   Engine.compass.transform.position.z = z - 0.5;
          //   Engine.compass.transform.position.y = Engine.grid[g].height + 0.5;
          // }

          if (Color.equals(Engine.grid[g].color, Color.CYAN) || Color.equals(Engine.grid[g].color, Color.GREEN)) {
            for (var i = 0, len = Engine.grid.length; i < len; i++) {
              if (i != g && Color.equals(Engine.grid[i].color, Engine.grid[g].color)) {
                Engine.moveTo(i);
                break;
              }
            }
          } else {
            Engine.moveTo(g);
          }
        }
      }
    }
  }

  Engine.interact.primaryUp = true;
}


Engine.processMouseEvent = function(event) {
  Engine.interact.x = event.clientX - Engine.stage.offsetLeft;
  Engine.interact.y = event.clientY - Engine.stage.offsetTop;
  Engine.interact.button = event.button;
  Engine.interact.buttons = event.buttons;
}


Engine.onClick = function(event) {

  // console.log('click');
}


Engine.onMouseDown = function(event) {
  Engine.processMouseEvent(event);
  Engine.interact.startX = Engine.interact.x;
  Engine.interact.startY = Engine.interact.y;
  Engine.interact.lastX = Engine.interact.x;
  Engine.interact.lastY = Engine.interact.y;
  Engine.interact.deltaX = 0;
  Engine.interact.deltaY = 0;
  Engine.interact.drag = false;

  if (Engine.interact.button == 0) {
    Engine.interact.primary = true;
    Engine.interact.primaryUp = false;
  }

  if (Engine.active) Engine.beginInteraction();

  Engine.interact.lastX = Engine.interact.x;
  Engine.interact.lastY = Engine.interact.y;
}


Engine.onMouseMove = function(event) {
  Engine.processMouseEvent(event);

  Engine.interact.deltaX = Engine.interact.x - Engine.interact.lastX;
  Engine.interact.deltaY = Engine.interact.y - Engine.interact.lastY;

  if (Engine.active) Engine.updateInteraction();

  Engine.interact.lastX = Engine.interact.x;
  Engine.interact.lastY = Engine.interact.y;

  // console.log(Engine.interact.deltaX);

}


Engine.onMouseUp = function(event) {
  Engine.processMouseEvent(event);
  if (Engine.active) Engine.endInteraction();

  // Engine.interact.lastX = Engine.interact.x;
  // Engine.interact.lastY = Engine.interact.y;

  Engine.interact.lastX = 0;
  Engine.interact.lastY = 0;
  Engine.interact.primary = false;
  Engine.interact.drag = false;

  // console.log('onMouseUp');
}


Engine.onMouseOut = function(event) {
  // Engine.interact.primary = false;
  // console.log('out');
}


Engine.onMouseOver = function(event) {
  // Engine.interact.primary = false;
}


Engine.processTouchEvent = function(event) {
  // Engine.interact.x = event.clientX - Engine.stage.offsetLeft;
  // Engine.interact.y = event.clientY - Engine.stage.offsetTop;
  Engine.interact.x = event.changedTouches[0].clientX - Engine.stage.offsetLeft;
  Engine.interact.y = event.changedTouches[0].clientY - Engine.stage.offsetTop;
  // Engine.interact.deltaX = Engine.interact.x - Engine.interact.lastX;
  // Engine.interact.deltaY = Engine.interact.y - Engine.interact.lastY;
  Engine.interact.primary = true;
  // Engine.interact.buttons = event.buttons;
}


Engine.onTouchStart = function(event) {
  event.preventDefault();

  Engine.processTouchEvent(event);
  Engine.interact.startX = Engine.interact.x;
  Engine.interact.startY = Engine.interact.y;
  Engine.interact.lastX = Engine.interact.x;
  Engine.interact.lastY = Engine.interact.y;
  Engine.interact.deltaX = Engine.interact.x - Engine.interact.lastX;
  Engine.interact.deltaY = Engine.interact.y - Engine.interact.lastY;

  Engine.beginInteraction();

}


Engine.onTouchMove = function(event) {
  event.preventDefault();
  Engine.processTouchEvent(event);

  Engine.interact.deltaX = Engine.interact.x - Engine.interact.lastX;
  Engine.interact.deltaY = Engine.interact.y - Engine.interact.lastY;

  if (Engine.active) Engine.updateInteraction();

  Engine.interact.lastX = Engine.interact.x;
  Engine.interact.lastY = Engine.interact.y;
}


Engine.onTouchEnd = function(event) {
  event.preventDefault();
  Engine.processTouchEvent(event);
  Engine.endInteraction();

  // Engine.interact.lastX = Engine.interact.x;
  // Engine.interact.lastY = Engine.interact.y;
  Engine.interact.lastX = 0;
  Engine.interact.lastY = 0;
  Engine.interact.primary = false;
}


Engine.initEventListeners = function() {
  window.addEventListener('blur', Engine.onBlur);
  window.addEventListener('focus', Engine.onFocus);
  window.addEventListener('keydown', Engine.onKeyDown);
  window.addEventListener('keyup', Engine.onKeyUp);

  // Engine.canvas.addEventListener('click', Engine.onClick);
  // Engine.canvas.addEventListener('mousedown', Engine.onMouseDown);
  // Engine.canvas.addEventListener('mousemove', Engine.onMouseMove);
  // Engine.canvas.addEventListener('mouseup', Engine.onMouseUp);
  // Engine.canvas.addEventListener('mouseout', Engine.onMouseOut);
  // Engine.canvas.addEventListener('mouseover', Engine.onMouseOver);
  window.addEventListener('mousedown', Engine.onMouseDown);
  window.addEventListener('mousemove', Engine.onMouseMove);
  window.addEventListener('mouseup', Engine.onMouseUp);
  window.addEventListener('mouseout', Engine.onMouseOut);
  window.addEventListener('mouseover', Engine.onMouseOver);

  Engine.canvas.addEventListener('contextmenu', Engine.onContextMenu);

  Engine.stage.addEventListener('touchstart', Engine.onTouchStart);
  Engine.stage.addEventListener('touchend', Engine.onTouchEnd);
  Engine.stage.addEventListener('touchmove', Engine.onTouchMove);

  // Engine.canvas.addEventListener('scroll', Engine.onScroll);
}
