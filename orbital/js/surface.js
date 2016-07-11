
function Surface(width, height, buffer) {
  this.width = width;
  this.height = height;
  this.buffer = buffer;
  this.depthBuffer = new Array(this.width * this.height);
}


Surface.prototype.clear = function(r, g, b, a) {
  for (var i = 0; i < this.buffer.data.length; i = i + 4) {
    this.buffer.data[i] = r !== undefined ? r : 0;
    this.buffer.data[i + 1] = g !== undefined ? g : 0;
    this.buffer.data[i + 2] = b !== undefined ? b : 0;
    this.buffer.data[i + 3] = a !== undefined ? a : 0;
  }
  for (var i = 0; i < this.depthBuffer.length; i++) {
    this.depthBuffer[i] = Number.POSITIVE_INFINITY;
  }
}


Surface.prototype.setPixel = function(x, y, color) {
  if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
    var index = (y * this.width + x) * 4;
    this.buffer.data[index] = 255 * color.r;
    this.buffer.data[index + 1] = 255 * color.g;
    this.buffer.data[index + 2] = 255 * color.b;
    this.buffer.data[index + 3] = 255 * color.a;
  }
}


Surface.prototype.edgeFunction = function(a, b, c) {
  // clockwise vertex ordering
  // return ((c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x) >= 0);
  // counter-clockwise vertex ordering
  return (a.x - b.x) * (c.y - a.y) - (a.y - b.y) * (c.x - a.x);
}


Surface.prototype.drawTriangle = function(v0, v1, v2, color) {
  var area = this.edgeFunction(v0, v1, v2);

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

  if (bbminy < 0) bbminy = 0;
  if (bbminx < 0) bbminx = 0;

  if (bbmaxy > this.height-1) bbmaxy = this.height-1;
  if (bbmaxx > this.width-1) bbmaxx = this.width-1;

  var p = new Vector();

  v0.z = 1 / v0.z;
  v1.z = 1 / v1.z;
  v2.z = 1 / v2.z;

  // for (var y = bbminy >> 0; y <= bbmaxy >> 0; y++) {
    // for (var x = bbminx >> 0; x <= bbmaxx >> 0; x++) {
  for (var y = Math.round(bbminy); y <= Math.round(bbmaxy); y++) {
    for (var x = Math.round(bbminx); x <= Math.round(bbmaxx); x++) {
      p.x = x;
      p.y = y;

      var w0 = this.edgeFunction(v1, v2, p);
      var w1 = this.edgeFunction(v2, v0, p);
      var w2 = this.edgeFunction(v0, v1, p);

      if (w0 >= 0 && w1 >= 0 && w2 >= 0) {

        w0 /= area;
        w1 /= area;
        w2 /= area;

        var oneOverZ = v0.z * w0 + v1.z * w1 + v2.z * w2;
        var z = 1 / oneOverZ;

        if (z < this.depthBuffer[p.y * this.width + p.x]) {
          this.depthBuffer[p.y * this.width + p.x] = z;
          this.setPixel(p.x, p.y, color);
        }
      }
    }
  }
}



// app.clamp = function (value, min, max) {
//   if (typeof min === "undefined") { min = 0; }
//   if (typeof max === "undefined") { max = 1; }
//   return Math.max(min, Math.min(value, max));
// }
//
//
// app.interpolate = function (min, max, gradient) {
//   return min + (max - min) * app.clamp(gradient);
// }
//
//
// app.drawTriangleLine = function(y, pa, pb, pc, pd, color) {
//
//   var gradient1 = pa.y != pb.y ? (y - pa.y) / (pb.y - pa.y) : 1;
//   var gradient2 = pc.y != pd.y ? (y - pc.y) / (pd.y - pc.y) : 1;
//
//   var sx = app.interpolate(pa.x, pb.x, gradient1) >> 0;
//   var ex = app.interpolate(pc.x, pd.x, gradient2) >> 0;
//
//   if (ex < sx) {
//     sx = ex + (ex = sx, 0);
//   }
//
//   var z1 = app.interpolate(pa.z, pb.z, gradient1);
//   var z2 = app.interpolate(pc.z, pd.z, gradient2);
//
//   for (var x = sx; x < ex; x++) {
//     var gradient = (x - sx) / (ex - sx);
//     var z = z1 + (z2 - z1) * Math.max(0, Math.min(gradient, 1));
//     var index = y * app.WIDTH + x;
//     if (app.depthBuffer[index] > z) {
//       app.depthBuffer[index] = z;
//       app.putPixel(Math.floor(x), Math.floor(y), color);
//     }
//   }
// }
//
//
// app.drawScanTriangle = function(p1, p2, p3, color) {
//   // Sort triangle points - p1 must be at the top
//
//   if(p1.y > p2.y) {
//       var temp = p2;
//       p2 = p1;
//       p1 = temp;
//   }
//   if(p2.y > p3.y) {
//       var temp = p2;
//       p2 = p3;
//       p3 = temp;
//   }
//   if(p1.y > p2.y) {
//       var temp = p2;
//       p2 = p1;
//       p1 = temp;
//   }
//
//   // Calculate slopes  p1p2, p1p3
//
//   var slope1, slope2;
//
//   if (p2.y - p1.y > 0)
//     slope1 = (p2.x - p1.x) / (p2.y - p1.y);
//   else
//     slope1 = 0;
//
//   if (p3.y - p1.y > 0)
//     slope2 = (p3.x - p1.x) / (p3.y - p1.y);
//   else
//     slope2 = 0;
//
//
//   // Compare slopes to determine triangle case |> or <|
//
//   if (slope1 > slope2) {
//     for (var y = Math.floor(p1.y); y <= Math.floor(p3.y); y++) {
//       if (y < p2.y)
//         app.drawTriangleLine(y, p1, p3, p1, p2, color);
//       else
//         app.drawTriangleLine(y, p1, p3, p2, p3, color);
//     }
//   } else {
//     for (var y = Math.floor(p1.y); y <= Math.floor(p3.y); y++) {
//       if (y < p2.y)
//         app.drawTriangleLine(y, p1, p2, p1, p3, color);
//       else {
//         app.drawTriangleLine(y, p2, p3, p1, p3, color);
//       }
//     }
//   }
//
// }
