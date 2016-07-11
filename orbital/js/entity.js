
function Entity(x, y, z) {
  this.position = new Vector(x, y, z);
  this.rotation = new Vector();
  this.scale = new Vector();

  this.t = new Matrix();
  this.t.a[12] = this.position.x;
  this.t.a[13] = this.position.y;
  this.t.a[14] = this.position.z;

  this.rx = new Matrix();
  this.ry = new Matrix();
  this.rz = new Matrix();
  this.r = new Matrix();

  this.s = new Matrix();
}

Entity.prototype.toString = function() {
  return "{" + this.position + "}";
}


Entity.prototype.toLocal = function(p) {
  var transform = Matrix.inverse(this.getTransform());
  return transform.multiplyPoint(p);
}


Entity.prototype.toWorld = function(p) {
  var transform = this.getTransform();
  return transform.multiplyPoint(p);
}


Entity.prototype.getTranslationMatrix = function() {
  this.t.a[12] = this.position.x;
  this.t.a[13] = this.position.y;
  this.t.a[14] = this.position.z;
  return this.t;
}


Entity.prototype.getRotationMatrix = function() {
  return this.rx.multiply(this.ry).multiply(this.rz);
}


Entity.prototype.getTransform = function() {
  // this.r = this.rx.multiply(this.ry).multiply(this.rz);
  // return this.r.multiply(this.t);
  var r = this.getRotationMatrix();
  var t = this.getTranslationMatrix();
  return r.multiply(t);
}


Entity.prototype.translate = function(x, y, z) {
  this.position.x += x;
  this.position.y += y;
  this.position.z += z;
  //
  // this.t.a[12] = this.position.x;
  // this.t.a[13] = this.position.y;
  // this.t.a[14] = this.position.z;

}

Entity.prototype.setRotX = function(x) {
  this.rotation.x = x;
  this.rx.identity();
  var cos = Math.cos(this.rotation.x * RAD);
  var sin = Math.sin(this.rotation.x * RAD);
  this.rx.a[5] = cos;
  this.rx.a[6] = sin;
  this.rx.a[9] = -sin;
  this.rx.a[10] = cos;
}


Entity.prototype.setRotY = function(y) {
  this.rotation.y = y;
  this.ry.identity();
  var cos = Math.cos(this.rotation.y * RAD);
  var sin = Math.sin(this.rotation.y * RAD);
  this.ry.a[0] = cos;
  this.ry.a[2] = -sin;
  this.ry.a[8] = sin;
  this.ry.a[10] = cos;
}


Entity.prototype.setRotZ = function(z) {
  this.rotation.z = z;
  this.rz.identity();
  var cos = Math.cos(this.rotation.z * RAD);
  var sin = Math.sin(this.rotation.z * RAD);
  this.rz.a[0] = cos;
  this.rz.a[1] = sin;
  this.rz.a[4] = -sin;
  this.rz.a[5] = cos;
}


Entity.prototype.setRotation = function(x, y, z) {
  this.rotation.x = x;
  this.rotation.y = y;
  this.rotation.z = z;

  this.setRotX(this.rotation.x);
  this.setRotY(this.rotation.y);
  this.setRotZ(this.rotation.z);

  // this.r = this.rx.multiply(this.ry).multiply(this.rz);
}


Entity.prototype.rotate = function(x, y, z) {
  this.rotation.x += x;
  this.rotation.y += y;
  this.rotation.z += z;

  if (x != 0) this.setRotX(this.rotation.x);
  if (y != 0) this.setRotY(this.rotation.y);
  if (z != 0) this.setRotZ(this.rotation.z);
  // this.setRotation(this.rotation.x, this.rotation.y, this.rotation.z);
}
