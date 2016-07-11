
function Camera(fov, aspect, near, far) {
  Entity.call(this, 0, 0, 0);

  this.direction = new Vector();

  this.projection = this.getProjection(fov, aspect, near, far);
  this.projectionInverse = this.projection.invert();
}

Camera.prototype = Object.create(Entity.prototype);
Camera.prototype.constructor = Camera;


Camera.prototype.getProjection = function(fov, aspect, near, far) {

  var scale = Math.tan(fov * 0.5 * RAD) * near;
  var top = scale;
  var bottom = -top;
  var right = aspect * scale;
  var left = -right;

  var projection = new Matrix();
  projection.a[0] = 2 * near / (right - left);
  projection.a[5] = 2 * near / (top - bottom);
  projection.a[8] = (right + left) / (right - left);
  projection.a[9] = (top + bottom) / (top - bottom);
  projection.a[10] = -(far + near) / (far - near);
  projection.a[11] = -1;
  projection.a[14] = -2 * far * near / (far - near);
  projection.a[15] = 0;

  return projection;
}


Camera.prototype.getOrthographic = function(aspect) {
}


// Camera.prototype.isPointVisible = function(p) {
// }
