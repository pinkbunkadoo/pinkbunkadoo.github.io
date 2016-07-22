
var Renderer = {};

Renderer.init = function(surface, view) {
  console.log('Renderer.init');
  Renderer.surface = surface;
  Renderer.view = view;

  // Renderer.depthArrayBuffer = new ArrayBuffer(Renderer.surface.width * Renderer.surface.height);
  // Renderer.idArrayBuffer = new ArrayBuffer(Renderer.surface.width * Renderer.surface.height);

  Renderer.depthBuffer = new Array(Renderer.surface.width * Renderer.surface.height);
  Renderer.idBuffer = new Array(Renderer.surface.width * Renderer.surface.height);

  Renderer.aspect = view.width / view.height;

  Renderer.clearDepthBuffer();
  Renderer.clearIdBuffer();

  Renderer.tricount = 0;
  Renderer.largetri = 0;
  Renderer.pixcount = 0;
  Renderer.zsort = true;
  Renderer.id = 0;

}


Renderer.clearIdBuffer = function() {
  for (var i = 0, len = Renderer.idBuffer.length; i < len; i++) Renderer.idBuffer[i] = 0;
}

Renderer.clearDepthBuffer = function() {
  for (var i = 0, len = Renderer.depthBuffer.length; i < len; i++) Renderer.depthBuffer[i] = Number.POSITIVE_INFINITY;
}


Renderer.reset = function() {
  Renderer.tricount = 0;
  Renderer.largetri = 0;
  Renderer.pixcount = 0;
  Renderer.clearDepthBuffer();
  Renderer.clearIdBuffer();
}


Renderer.screenToRaster = function(p) {
  var out = new Vector();
  out.x = Renderer.view.x + ((p.x + 1) * 0.5 * Renderer.view.width);
  out.y = Renderer.view.y + ((1 - p.y) * 0.5 * Renderer.view.height);
  out.z = (p.z !== undefined ? p.z : 0);
  return out;
}


Renderer.projectPoint = function(p, cameraTransform) {
  var camera = Renderer.view.camera;
  // var pCamera = camera.toLocal(p);

  var pCamera = cameraTransform.multiplyPoint(p);

  if (camera.orientation) {
    pCamera = camera.orientation.multiplyPoint(pCamera);
  }

  var projection = camera.projection;
  var pScreen;

  if (camera.type == Camera.ORTHOGRAPHIC) {
    projection = Camera.orthographic(Renderer.view.width, Renderer.view.height, camera.near, camera.far, camera.orthoScale);
    pScreen = projection.multiplyPoint(pCamera);
  } else {
    projection = Camera.perspectiveFOV(camera.fov, Renderer.aspect, camera.near, camera.far);
    pScreen = projection.multiplyPoint(pCamera);
    // pScreen = new Vector();
    // pScreen.x = (pCamera.x / (1- pCamera.z));
    // pScreen.y = (pCamera.y / (1-pCamera.z));
  }


  pScreen.z = -pCamera.z;

  return pScreen;
}


Renderer.setPixel = function(x, y, r, g, b, a) {
  if (x >= 0 && y >= 0 && x < Renderer.surface.width && y < Renderer.surface.height) {
    // var index = (y * Renderer.surface.width + x) * 4;
    Renderer.surface.buf32[y * Renderer.surface.width + x] = (255 << 24) | (b << 16) | (g << 8) | r;
  }
}


// Bresenham Line Algorithm
// http://www.edepot.com/linebresenham.html

Renderer.line = function(x1, y1, x2, y2, r, g, b, a) {
	var x = 0, y = 0;
	var dx = 0, dy = 0;
	var incx = 0, incy = 0;
	var balance = 0;

	if (x2 >= x1) {
		dx = x2 - x1;
		incx = 1;
	} else {
		dx = x1 - x2;
		incx = -1;
	}

	if (y2 >= y1) {
		dy = y2 - y1;
		incy = 1;
	} else {
		dy = y1 - y2;
		incy = -1;
	}

	x = x1;
	y = y1;

	if (dx >= dy) {
		dy <<= 1;
		balance = dy - dx;
		dx <<= 1;

		while (x != x2) {
			Renderer.setPixel(x, y, r, g, b, a);
			if (balance >= 0) {
				y += incy;
				balance -= dx;
			}
			balance += dy;
			x += incx;
		}
    Renderer.setPixel(x, y, r, g, b, a);
	} else {
		dx <<= 1;
		balance = dx - dy;
		dy <<= 1;

		while (y != y2) {
			Renderer.setPixel(x, y, r, g, b, a);
			if (balance >= 0) {
				x += incx;
				balance -= dy;
			}
			balance += dx;
			y += incy;
		}
    Renderer.setPixel(x, y, r, g, b, a);
	}
}


Renderer.drawLine = function(line) {
  var m = (Renderer.view.camera.getTransformMatrix()).inverse();
  var a = Renderer.screenToRaster(Renderer.projectPoint(line.a, m)).round();
  var b = Renderer.screenToRaster(Renderer.projectPoint(line.b, m)).round();
  Renderer.line(a.x, a.y, b.x, b.y, line.color.r, line.color.g, line.color.b, line.color.a);
}


Renderer.edgeFunction = function(a, b, c) {
  // clockwise vertex ordering
  // return ((c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x) >= 0);

  // counter-clockwise vertex ordering
  return (a.x - b.x) * (c.y - a.y) - (a.y - b.y) * (c.x - a.x);
}


Renderer.drawTriangle = function(v0, v1, v2, illumination, tint, texture, id) {
  var bbminx = Number.POSITIVE_INFINITY;
  var bbminy = Number.POSITIVE_INFINITY;
  var bbmaxx = Number.NEGATIVE_INFINITY;
  var bbmaxy = Number.NEGATIVE_INFINITY;

  if (v0.x < bbminx) bbminx = v0.x;
  if (v1.x < bbminx) bbminx = v1.x;
  if (v2.x < bbminx) bbminx = v2.x;

  if (v0.y < bbminy) bbminy = v0.y;
  if (v1.y < bbminy) bbminy = v1.y;
  if (v2.y < bbminy) bbminy = v2.y;

  if (v0.x > bbmaxx) bbmaxx = v0.x;
  if (v1.x > bbmaxx) bbmaxx = v1.x;
  if (v2.x > bbmaxx) bbmaxx = v2.x;

  if (v0.y > bbmaxy) bbmaxy = v0.y;
  if (v1.y > bbmaxy) bbmaxy = v1.y;
  if (v2.y > bbmaxy) bbmaxy = v2.y;

  if (bbminx < Renderer.view.x) bbminx = 0;
  if (bbminy < Renderer.view.y) bbminy = 0;

  if (bbmaxx > Renderer.view.width + Renderer.view.x - 1) bbmaxx = Renderer.view.width + Renderer.view.x - 1;
  if (bbmaxy > Renderer.view.height + Renderer.view.y - 1) bbmaxy = Renderer.view.height + Renderer.view.y - 1;

  bbminx = Math.round(bbminx);
  bbmaxx = Math.round(bbmaxx);
  bbminy = Math.round(bbminy);
  bbmaxy = Math.round(bbmaxy);

  if (bbmaxx - bbminx >= 8) {
    Renderer.largetri++;
  }

  // if (bbmaxy - bbminy >= 8) {
  // }

  var v0z = 1 / v0.z;
  var v1z = 1 / v1.z;
  var v2z = 1 / v2.z;

  var area = Renderer.edgeFunction(v0, v1, v2);

  var w0f, w1f, w2f;
  var w0, w1, w2;
  var w0_step, w1_step, w2_step;
  var oneOverZ, z;
  var cr, cg, cb;
  var p = new Vector();
  var computedColor = new Color();
  var u, v;
  var s, z;

  for (var y = bbminy; y <= bbmaxy; y++) {
    var out = true;
    p.x = bbminx;
    p.y = y;

    w0f = Renderer.edgeFunction(v1, v2, p);
    w1f = Renderer.edgeFunction(v2, v0, p);
    w2f = Renderer.edgeFunction(v0, v1, p);

    s = 0;

    for (var x = bbminx; x <= bbmaxx; x++, s++) {
      Renderer.pixcount++;
      p.x = x;

      w0 = w0f + -(v1.y - v2.y) * s;
      w1 = w1f + -(v2.y - v0.y) * s;
      w2 = w2f + -(v0.y - v1.y) * s;

      if (w0 >= 0 && w1 >= 0 && w2 >= 0) {
        w0 = w0 / area;
        w1 = w1 / area;
        w2 = w2 / area;

        // Perspective correct
        // oneOverZ = v0z * w0 + v1z * w1 + v2z * w2;
        // z = 1 / oneOverZ;

        // No perspective correct
        z = v0.z * w0 + v1.z * w1 + v2.z * w2;


        var index = y * Renderer.surface.width + x;

        if (z < Renderer.depthBuffer[index]) {
          Renderer.depthBuffer[index] = z;

          cr = 255;
          cg = 255;
          cb = 255;

          if (v0.color !== undefined) {
            cr = v0.color.r;
            cg = v0.color.g;
            cb = v0.color.b;
            if (tint) {
              cr = cr * tint.r >> 0;
              cg = cg * tint.g >> 0;
              cb = cb * tint.b >> 0;
            }
          }

          if (v0.uv) {
            // u = v0.uv[0] * w0 + v1.uv[0] * w1 + v2.uv[0] * w2;
            // v = v0.uv[1] * w0 + v1.uv[1] * w1 + v2.uv[1] * w2;
          }

          if (texture) {
            // var c32 = texture.uvLookup(u, v);
            // cr = c32 & 0xff;
            // cg = (c32 >> 8) & 0xff;
            // cb = (c32 >> 16) & 0xff;
          }

          // if (ao) {
            // var c32 = ao.uvLookup(u, v);
            // cr = cr * ((c32 & 0xff) / 255);
            // cg = cg * (((c32 >> 8) & 0xff) / 255);
            // cb = cb * (((c32 >> 16) & 0xff) / 255);
          // }

          if (illumination !== undefined) {
            cr = (cr * illumination.r) >> 0;
            cg = (cg * illumination.g) >> 0;
            cb = (cb * illumination.b) >> 0;
          }

          if (id > 0) Renderer.idBuffer[index] = id;
          Renderer.setPixel(x, y, cr, cg, cb, 255);
        }

        out = false;
      } else {
        if (out == false) {
          break;
        }
      }

    }
  }

  Renderer.tricount++;
}

