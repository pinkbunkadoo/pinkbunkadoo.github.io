
function Camera(type, fov, near, far) {
  Entity.call(this, 0, 0, 0);

  this.fov = (fov !== undefined ? fov : 90);
  this.near = (near !== undefined ? near : 0.1);
  this.far = (far !== undefined ? far : 100);
  this.type = (type !== undefined ? type : Camera.PERSPECTIVE);
  this.orthoScale = 1.0
  this.orientation = new Matrix();
  this.projection = null;

  // if (this.type == Camera.ORTHOGRAPHIC) {
  //   // projection = Camera.orthographic(Renderer.view.width, Renderer.view.height, 0.1, 100, camera.orthoScale);
  //   this.projection = Camera.orthographic(320, 200, 0.1, 100, this.orthoScale);
  // } else {
  //   this.projection = Camera.perspectiveFOV(this.fov, 320/200, 0.1, 100);
  // }

}

Camera.prototype = Object.create(Entity.prototype);
Camera.prototype.constructor = Camera;

Camera.ORTHOGRAPHIC = 'orthographic';
Camera.PERSPECTIVE = 'perspective';


Camera.prototype.lookAt = function(eye, target, up) {
  var m = new Matrix();

  zaxis = Vector.subtract(eye, target).normalize();
  xaxis = Vector.cross(up, zaxis).normalize();
  yaxis = Vector.cross(zaxis, xaxis).normalize();

  m.a[0] = xaxis.x, m.a[1] = yaxis.x, m.a[2] = zaxis.x;
  m.a[4] = xaxis.y, m.a[5] = yaxis.y, m.a[6] = zaxis.y;
  m.a[8] = xaxis.z, m.a[9] = yaxis.z, m.a[10] = zaxis.z;

  this.orientation = m;
  // m.a[12] = -Vector.dot(xaxis, eye);
  // m.a[13] = -Vector.dot(yaxis, eye);
  // m.a[14] = -Vector.dot(zaxis, eye);

  this.xaxis = xaxis;
  this.yaxis = yaxis;
  this.zaxis = zaxis;

  // return m;
}


Camera.perspectiveFOV = function(fov, aspect, near, far) {
  var w = 1 / Math.tan(fov * 0.5 * RAD);
  var h = w * aspect;
  var q = far / (near - far);

  var m = new Matrix();
  m.a[0] = w;
  m.a[5] = h;
  m.a[10] = q;
  m.a[11] = -1;
  m.a[14] = near * q;
  // m.a[15] = 0;
  return m;
}


Camera.perspective = function(width, height, near, far) {
  var w = (2 * near) / width;
  var h = (2 * near) / height;

  var m = new Matrix();
  m.a[0] = 2 * near / width;
  m.a[5] = 2 * near / height;
  // m.a[0] = w;
  // m.a[5] = h;
  m.a[10] = far / (near - far);
  m.a[11] = -1;
  m.a[14] = near * far / (near - far);
  m.a[15] = 0;
  return m;
}


Camera.orthographic = function(width, height, near, far, scale) {
  var s = (scale !== undefined ? scale : 1.0);
  var w = width / height;
  var h = 1;
  var m = new Matrix();
  // m.a[0] = (2 / w) * s;
  // m.a[5] = (2 / h) * s;
  m.a[0] = (2 / w) * s;
  m.a[5] = (2 / h) * s;
  m.a[10] = 1 / (near - far);
  m.a[14] = near / (near - far);
  return m;
}


Camera.lookAt = function(eye, target, up) {
  var m = new Matrix();

  zaxis = Vector.subtract(eye, target).normalize();
  xaxis = Vector.cross(up, zaxis).normalize();
  yaxis = Vector.cross(zaxis, xaxis).normalize();

  m.a[0] = xaxis.x, m.a[1] = yaxis.x, m.a[2] = zaxis.x;
  m.a[4] = xaxis.y, m.a[5] = yaxis.y, m.a[6] = zaxis.y;
  m.a[8] = xaxis.z, m.a[9] = yaxis.z, m.a[10] = zaxis.z;
  // m.a[12] = -Vector.dot(xaxis, eye);
  // m.a[13] = -Vector.dot(yaxis, eye);
  // m.a[14] = -Vector.dot(zaxis, eye);

  return m;
}


