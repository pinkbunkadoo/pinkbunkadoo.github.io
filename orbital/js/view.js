
function View(x, y, width, height, buffer) {
  this.x = (x === undefined ? 0 : x);
  this.y = (y === undefined ? 0 : y);
  this.width = (width === undefined ? 0 : width);
  this.height = (height === undefined ? 0 : height);

  this.surface = new Surface(width, height, buffer);
  this.camera = null;
}


View.prototype.setCamera = function(camera) {
  this.camera = camera;
}


View.prototype.screenToRaster = function(p) {
  return new Vector((p.x + 1) / 2 * this.width, (1 - p.y) / 2 * this.height, p.z !== undefined ? p.z : 0);
}


View.prototype.projectPoint = function(p) {
  var pCamera = this.camera.toLocal(p);
  var pScreen = this.camera.projection.multiplyPoint(pCamera);

  // Convert from Screen to Raster coordinates
  var pRaster = this.screenToRaster(new Vector(pScreen.x, pScreen.y, -pCamera.z));
  return pRaster;
}
