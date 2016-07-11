
var app = {};

app.MESH_PLANET = "planet.obj";
app.MESH_SATELLITE = "satellite.obj";
app.MESH_DEBRIS = "debris.obj";
app.MESH_PLATFORM = "platform.obj";

app.init = function(width, height) {
  console.log("init");

  app.fps = 60;
  app.interact = {};
  app.entities = [];

  app.width = width;
  app.height = height;

  // app.surfaceObjectLookup = new Array(app.width * app.height);

  app.createElements();
  app.initEventListeners();
  app.loadResources();
}


app.createElements = function() {
  document.body.style.backgroundColor = "rgb(0, 0, 0)";

  app.stage = document.createElement("div");
  app.stage.id = "stage";
  app.stage.style.position = "absolute";
  app.stage.style.overflow = "hidden";
  app.stage.style.top = "50%";
  app.stage.style.left = "50%";
  app.stage.style.width = app.width + "px";
  app.stage.style.height = app.height + "px";
  app.stage.style.margin = "-" + (app.height / 2) + "px 0 0 -" + (app.width / 2) + "px";
  app.stage.style.background = "#ccc";
  app.stage.style.userSelect = "none";
  document.body.appendChild(app.stage);

  app.canvas = document.createElement("canvas");
  app.canvas.style.backgroundColor = "blue";
  app.canvas.id = "surface";
  app.canvas.width = app.width;
  app.canvas.height = app.height;
  app.canvas.style.userSelect = "none";
  app.stage.appendChild(app.canvas);

  app.offscreenCanvas = document.createElement("canvas");
  app.offscreenCanvas.width = app.width;
  app.offscreenCanvas.height = app.height;

  app.context = app.canvas.getContext("2d");
  app.offscreenContext = app.offscreenCanvas.getContext("2d");
  // app.buffer = app.context.createImageData(app.width, app.height);
}


app.loadResources = function() {
  app.res = new Resource(app.onResourceLoad);
  app.res.load(app.MESH_PLANET);
  app.res.load(app.MESH_SATELLITE);
  app.res.load(app.MESH_DEBRIS);
  app.res.load(app.MESH_PLATFORM);

  // for (var i = 0; i < app.entities.length; i++) {
  //   var entity = app.map.entities[i];
  //   if (entity.mesh) {
  //     app.res.load(entity.mesh);
  //   }
  // }
}


app.onResourceLoad = function(filename) {
  if (app.res.finished()) {
    app.bootup();
  }
}


app.createWorld = function() {
  // var buffer = app.context.createImageData(128, 128);
  // app.view = new View(0, 0, 128, 128, buffer);

  // var w = Math.floor(app.width * 0.8), h = w;
  var w = app.width, h = app.height;

  app.view = new View(0, 0, w, h, app.context.createImageData(w, h));
  var camera = new Camera(60, w / h, 1, 1000);
  camera.rotate(-45, 0, 0);
  camera.translate(0, 2.5, 2.5);
  app.view.setCamera(camera);

  w = Math.floor(app.width * 0.2), h = w;

  app.viewSat = new View(0, 0, w, h, app.context.createImageData(w, h));
  var camera = new Camera(60, w / h, 1, 1000);
  camera.rotate(-45, 0, 0);
  camera.translate(0, 1, 1);
  app.viewSat.setCamera(camera);

  app.light = new Light(0, 0, 0);
  app.light.setDirection(-1, -1, -1);

  app.satellite = new Entity(0, 0, 0);
  // app.satellite.mesh = Mesh.fromOBJ(app.res.get(app.MESH_SATELLITE));

  app.meshes = {};
  app.meshes[app.MESH_SATELLITE] = Mesh.fromOBJ(app.res.get(app.MESH_SATELLITE));
  app.meshes[app.MESH_DEBRIS] = Mesh.fromOBJ(app.res.get(app.MESH_DEBRIS));
  app.meshes[app.MESH_PLATFORM] = Mesh.fromOBJ(app.res.get(app.MESH_PLATFORM));

  app.planet = new Entity(0, 0, 0);
  app.planet.mesh = Mesh.fromOBJ(app.res.get(app.MESH_PLANET));

  app.entities.push(new Satellite(1.01, 0, 0, Satellite.SATELLITE));
  app.entities.push(new Satellite(1.01, 100, 70, Satellite.DEBRIS));
  app.entities.push(new Satellite(1.1, 0, 20, Satellite.PLATFORM));
  app.entities.push(new Satellite(1.5, 0, 0, Satellite.SATELLITE));
  // app.entities.push(new Satellite(6.56, 0, 0, Satellite.SATELLITE));

  app.selection = null;
}


app.bootup = function() {
  // app.surface = new Surface(app.width, app.height, app.buffer);
  app.createWorld();

  app.time = 0;
  app.timeOverflow = 0;
  app.initialised = true;

  app.resume();
}


app.resume = function() {
  if (app.initialised) {
    app.active = true;
    app.actualTime = new Date().getTime();
    app.previousActualTime = app.actualTime;
    app.frameID = requestAnimationFrame(app.frame);
  }
}


app.stop = function() {
  app.active = false;
  cancelAnimationFrame(app.frameID);
}


app.frame = function() {
  if (app.active) {
    app.actualTime = new Date().getTime();
    app.time += app.actualTime - app.previousActualTime;
    app.timeDelta = app.time - app.previousTime;

    if (app.timeOverflow + app.timeDelta >= 1 / app.fps) {
      app.update(1 / app.fps);
      app.timeOverflow -= Math.min(app.timeOverflow, 1 / app.fps);
    }
    // app.timeOverflow

    app.draw();

    app.previousTime = app.time;
    app.previousActualTime = app.actualTime;

    app.frameID = requestAnimationFrame(app.frame);
  }
}

app.update = function(delta) {
  for (var i = 0; i < app.entities.length; i++) {
    var satellite = app.entities[i];
    var circum = (2 * Math.PI * satellite.orbitalRadius);
    var jump = (360 / circum) * 0.1 * delta;
    satellite.angle = satellite.angle + jump;

    if (satellite.angle >= 360) {
      satellite.angle = satellite.angle % 360;
      satellite.cycles++;
    }

    var p = satellite.getWorldOrbitPosition(satellite.angle);

    satellite.position.x = p.x;
    satellite.position.y = p.y;
    satellite.position.z = p.z;
  }

  app.satellite.rotate(0, 0.5, 0);
  app.planet.rotate(0, 0.05, 0);
}


app.drawEntity = function(view, entity) {
  var mesh = entity.mesh;
  if (mesh) {
    var transform = entity.getTransform();
    var cameraTransform = view.camera.getTransform();

    for (var i = 0; i < mesh.triangles.length; i++) {
      var triangle = mesh.triangles[i];

      var c0 = mesh.colors[triangle.colors[0]] || new Color(1, 1, 1, 1);

      var v0 = Vector.copy(mesh.vertices[triangle.vertices[0]]);
      var v1 = Vector.copy(mesh.vertices[triangle.vertices[1]]);
      var v2 = Vector.copy(mesh.vertices[triangle.vertices[2]]);

      v0 = transform.multiplyPoint(v0);
      v1 = transform.multiplyPoint(v1);
      v2 = transform.multiplyPoint(v2);

      var n = Vector.cross(Vector.subtract(v1, v0), Vector.subtract(v2, v0));
      n.normalize();

      var facingRatio = Math.max(0, Vector.dot(n, Vector.scale(app.light.direction, -1)));

      // var v0Cam = cameraTransform.multiplyPoint(v0);
      // var v1Cam = cameraTransform.multiplyPoint(v1);
      // var v2Cam = cameraTransform.multiplyPoint(v2);
      // var color = (0.25 + (i % mesh.triangles.length) * 0.75 / mesh.triangles.length);

      var c = Math.max(0.3, facingRatio);

      var r = c0.r * c;
      var g = c0.g * c;
      var b = c0.b * c;
      var rgba = new Color(r, g, b);

      v0 = view.projectPoint(v0);
      v1 = view.projectPoint(v1);
      v2 = view.projectPoint(v2);

      if (v0.z > 1.0 && v1.z > 1.0 && v2.z > 1.0) {
        view.surface.drawTriangle(v0, v1, v2, rgba);
      }
    }
  }
}


app.drawEntities = function() {
  // for (var i = 0; i < app.entities.length; i++) {
  //   app.drawEntity(app.view, app.entities[i]);
  // }
  if (app.selection) {
    app.drawEntity(app.viewSat, app.satellite);
  }

  if (app.planet) {
    app.drawEntity(app.view, app.planet);
  }

}


app.drawOrbits = function() {
  var ctx = app.context;
  // Satellites
  var color = new Color(1, 1, 1, 0.6);
  var color_dark = new Color(1, 1, 1, 0.2);
  // var color2 = new Color(1.0, 0, 0);

  // for (var i = 0; i < app.entities.length; i++) {
  if (app.selection) {
    // var satellite = app.entities[i];
    var satellite = app.selection;
    var cutoff = Math.round(app.view.camera.position.length() * 1);

    // var jump = cutoff / Math.min(cutoff, satellite.orbitalRadius);
    var jump = cutoff / satellite.orbitalRadius;

    for (var t = 0; t < 360; t += jump) {
      var p = satellite.getWorldOrbitPosition(t);
      p = app.view.projectPoint(p);

      var x = Math.floor(p.x), y = Math.floor(p.y);

      if (p.z < app.view.surface.depthBuffer[y * app.view.width + x]) {
        //  app.view.surface.depthBuffer[y * app.view.width + x] = p.z;
         app.view.surface.setPixel(x, y, color);

        //  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        //  ctx.beginPath();
        //  ctx.arc(p.x, p.y, 1, 0, 2 * Math.PI);
        //  ctx.fill();
        //  ctx.closePath();

      } else {
        app.view.surface.setPixel(x, y, color_dark);
      }
    }
    // var p = satellite.getWorldOrbitPosition(0);
    // p = app.projectPoint(p);
    // app.surface.setPixel(Math.floor(p.x), Math.floor(p.y), color2);
  }
}


app.drawRoundRect = function(x, y, width, height, radius, color) {
  var ctx = app.context;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - 1 - radius, y);

  // ctx.quadraticCurveTo(x + width, y, x + width, y + radius*2);

  // ctx.lineTo(x + width - radius * 2, y);

  // ctx.moveTo(x + width, y + radius);
  ctx.quadraticCurveTo(x + width - 1, y, x + width - 1, y + radius);
  ctx.lineTo(x + width - 1, y + height - 1 - radius);

  // ctx.moveTo(x + width - radius, y + height);
  ctx.quadraticCurveTo(x + width - 1, y + height - 1, x + width - 1 - radius, y + height - 1);
  ctx.lineTo(x + radius, y + height - 1);

  // ctx.moveTo(x, y + height - radius);
  ctx.quadraticCurveTo(x, y + height - 1, x, y + height - 1 - radius);
  ctx.lineTo(x, y + radius);

  ctx.quadraticCurveTo(x, y, x + radius, y);

  ctx.stroke();
  // ctx.
}


app.drawOverlay = function() {
  var ctx = app.context;

  ctx.save();
  // ctx.translate(0.5, 0.5);

  // app.drawRoundRect(Math.floor(app.view.width * 0.8)+1, 1, Math.floor(app.view.width * 0.2)-2, Math.floor(app.view.width * 0.2)-2, 12, "rgba(255, 255, 255, 0.25)");

  // // Earth
  var p = new Vector();
  p = app.view.projectPoint(p);

  // ctx.save();
  // ctx.lineWidth = 4;
  // ctx.fillStyle = "rgba(64, 160, 192, 0.2)";
  // ctx.strokeStyle = ctx.fillStyle;
  // ctx.beginPath();
  // ctx.arc(p.x, p.y, 60, 0, Math.PI * 2);
  // // ctx.globalCompositeOperation = "darken";
  // // ctx.fill();
  // ctx.globalCompositeOperation = "screen";
  // ctx.stroke();
  // ctx.closePath();
  //
  // ctx.restore();

  // Satellites
  for (var i = 0; i < app.entities.length; i++) {
    var entity = app.entities[i];

    if (entity instanceof Satellite) {
      var p = new Vector(entity.position.x, entity.position.y, entity.position.z);
      p = app.view.projectPoint(p);

      if (entity.type == Satellite.DEBRIS) {
        ctx.fillStyle = "rgb(255, 60, 0)";
        // ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
      } else if (entity.type == Satellite.SATELLITE) {
        ctx.fillStyle = "rgb(60, 220, 0)";
      } else if (entity.type == Satellite.PLATFORM) {
        ctx.fillStyle = "rgb(255, 212, 0)";
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();

      if (app.selection == entity) {
        ctx.lineWidth = 1.25;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        // ctx.arc(Math.floor(p.x), Math.floor(p.y), 20, 0, 2 * Math.PI);
        ctx.arc(p.x, p.y, 10, 0, 2 * Math.PI);
        ctx.stroke();
        // ctx.closePath();

        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        var metric = ctx.measureText(entity.type);
        ctx.fillText(entity.type, app.viewSat.width / 2 - metric.width / 2, app.viewSat.height);
        var m = 1;
        ctx.fillText("altitude: " + (entity.getAltitude()/1000).toPrecision(5) + " km", 10, app.viewSat.height + (++m * 10));
        ctx.fillText("period: " + (entity.getOrbitalPeriod()/60).toPrecision(4) + " minutes", 10, app.viewSat.height + (++m * 10));
        ctx.fillText("speed: " + (entity.getOrbitalVelocity()/1000).toPrecision(4) + " km/s", 10, app.viewSat.height + (++m * 10));

        // ctx.fillText("inclination: " + entity.inclination, 10, app.viewSat.height  + (++m * 10));
        // ctx.fillText("ascension: " + entity.ascension, 10, app.viewSat.height  + (++m * 10));

      }

    }
  }

  ctx.restore();
}


app.clearSurface = function() {
  app.view.surface.clear();
  app.viewSat.surface.clear();
}


app.swapBuffer = function() {
  // app.context.globalCompositeOperation = "overlay";
  // app.offscreenContext.fillStyle = "blue";
  // app.offscreenContext.fillRect(0, 0, app.width, app.height);

  app.offscreenContext.putImageData(app.view.surface.buffer, app.view.x, app.view.y);
  app.context.drawImage(app.offscreenCanvas, 0, 0);

  app.offscreenContext.putImageData(app.viewSat.surface.buffer, app.viewSat.x, app.viewSat.y);
  app.context.drawImage(app.offscreenCanvas, 0, 0);

}


app.draw = function() {
  app.context.fillStyle = "rgb(8, 8, 8)";
  app.context.fillRect(0, 0, app.width, app.height);

  app.clearSurface();
  app.drawEntities();
  app.drawOrbits();
  app.swapBuffer();
  app.drawOverlay();
}


app.initEventListeners = function() {
  window.addEventListener("blur", app.onBlur);
  window.addEventListener("focus", app.onFocus);
  window.addEventListener("keydown", app.onKeyDown);
  window.addEventListener("keyup", app.onKeyUp);

  app.canvas.addEventListener("mousedown", app.onMouseDown);
  app.canvas.addEventListener("mousemove", app.onMouseMove);
  app.canvas.addEventListener("mouseup", app.onMouseUp);
  app.canvas.addEventListener("contextmenu", app.onContextMenu);

  app.stage.addEventListener("touchstart", app.onTouchStart);
  app.stage.addEventListener("touchend", app.onTouchEnd);
  app.stage.addEventListener("touchmove", app.onTouchMove);
}


app.onBlur = function(event) {
  app.stop();
}


app.onFocus = function(event) {
  app.resume();
}


app.keyTimeout  = function(key) {
}


app.onContextMenu = function() {
  event.preventDefault();
}


app.onKeyDown = function(event) {
  if (event.key == "ArrowLeft")
  {
    if (app.selection)
      app.selection.setAscension(app.selection.ascension - 10);
  }
  else if (event.key == "ArrowUp")
  {
    if (app.selection)
      app.selection.setInclination(app.selection.inclination + 10);
    // console.log(app.entities[0].inclination, app.entities[0].ascension);
  }
  else if (event.key == "ArrowRight")
  {
    if (app.selection)
      app.selection.setAscension(app.selection.ascension + 10);
    // console.log("right",app.entities[0].ascension);
  }
  else if (event.key == "ArrowDown")
  {
    if (app.selection)
      app.selection.setInclination(app.selection.inclination - 10);
    // console.log(app.entities[0].inclination, app.entities[0].ascension);
  }
  else if (event.key == "+")
  {
    app.view.camera.position.scale(0.9);
    // app.view.camera.translate(0, 0, -10);
  }
  else if (event.key == "-")
  {
    app.view.camera.position.scale(1.1);
    // app.view.camera.translate(0, 0, 10);
  }
}


app.onKeyUp = function(event) {
}


app.beginInteraction = function() {
  var p = new Vector(app.interact.x, app.interact.y, 0);

  for (var i = 0; i < app.entities.length; i++) {
    var entity = app.entities[i];
    if (entity instanceof Satellite) {
      var p2 = app.view.projectPoint(entity.position);
      if (pointInCircle(p.x, p.y, p2.x, p2.y, 16)) {
        app.selection = entity;
        if (entity.type == Satellite.DEBRIS)
          app.satellite.mesh = app.meshes[app.MESH_DEBRIS];
        else if (entity.type == Satellite.SATELLITE)
          app.satellite.mesh = app.meshes[app.MESH_SATELLITE];
        else if (entity.type == Satellite.PLATFORM)
          app.satellite.mesh = app.meshes[app.MESH_PLATFORM];

        app.satellite.setRotation(0, 0, 0);
        break;
      }
    }
  }
}


app.updateInteraction = function() {
  var x = app.interact.y - app.interact.lastY;
  var y = app.interact.x - app.interact.lastX;

  if (app.interact.buttons & 1) {
    // app.player.rotate(x, y, 0);
  }
  if (app.interact.buttons & 4) {
    // app.camera.translate(-y/10, x/10, 0);
  }
}


app.endInteraction = function() {
}


app.processMouseEvent = function(event) {
  app.interact.x = event.clientX - app.stage.offsetLeft;
  app.interact.y = event.clientY - app.stage.offsetTop;
  app.interact.startX = app.interact.x;
  app.interact.startY = app.interact.y;
  app.interact.buttons = event.buttons;
}


app.onMouseDown = function(event) {
  app.processMouseEvent(event);
  app.beginInteraction();

  app.interact.lastX = app.interact.x;
  app.interact.lastY = app.interact.y;
}


app.onMouseMove = function(event) {
  app.processMouseEvent(event);
  app.updateInteraction();

  app.interact.lastX = app.interact.x;
  app.interact.lastY = app.interact.y;
}


app.onMouseUp = function(event) {
  app.processMouseEvent(event);
  app.endInteraction();

  app.interact.lastX = app.interact.x;
  app.interact.lastY = app.interact.y;
}


app.onMouseOut = function(event) {
}


app.onMouseOver = function(event) {
}
