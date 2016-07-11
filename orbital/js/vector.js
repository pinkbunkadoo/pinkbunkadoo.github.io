
function Vector(x, y, z) {
  this.x = (x === undefined ? 0 : x);
  this.y = (y === undefined ? 0 : y);
  this.z = (z === undefined ? 0 : z);
}


Vector.prototype.toString = function() {
  return "{" + this.x + "," + this.y + "," + this.z + "}";
}


Vector.prototype.add = function(vector) {
  this.x = this.x + vector.x;
  this.y = this.y + vector.y;
  this.z = this.z + vector.z;
  // return new Vector(this.x + vector.x, this.y + vector.y, this.z + vector.z);
}


Vector.prototype.divide = function(vector) {
  this.x = this.x / vector.x;
  this.y = this.y / vector.y;
  this.z = this.z / vector.z;
  // return new Vector(this.x / vector.x, this.y / vector.y, this.z / vector.z);
}


Vector.prototype.equals = function(vector) {
  return this.x === vector.x && this.y === vector.y && this.z === vector.z;
}


Vector.prototype.length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
}


Vector.prototype.limit = function(max) {
  if (this.length() > max) {
    this.normalize();
    this.scale(max);
  }
}


Vector.prototype.multiply = function(vector) {
  this.x = this.x * vector.x;
  this.y = this.y * vector.y;
  this.z = this.z * vector.z;
  // return new Vector(this.x * vector.x, this.y * vector.y, this.z * vector.z);
}


Vector.prototype.normalize = function() {
  var dot = this.x * this.x + this.y * this.y + this.z * this.z;
  if (dot > 0) {
    var inverseLength = 1 / Math.sqrt(dot);
    this.x = this.x * inverseLength;
    this.y = this.y * inverseLength;
    this.z = this.z * inverseLength;
  }
  // var len = this.length();
  // if (len != 0) {
  //   this.x = this.x / len;
  //   this.y = this.y / len;
  //   this.z = this.z / len;
  // }
}


Vector.prototype.scale = function(scalar) {
  this.x = this.x * scalar;
  this.y = this.y * scalar;
  this.z = this.z * scalar;
  // return new Vector(this.x * scalar, this.y * scalar, this.z * scalar);
}


Vector.prototype.subtract = function(vector) {
  this.x = this.x - vector.x;
  this.y = this.y - vector.y;
  this.z = this.z - vector.z;
  // return new Vector(this.x - vector.x, this.y - vector.y, this.z - vector.z);
}


Vector.add = function(a, b) {
  return new Vector(a.x + b.x, a.y + b.y, a.z + b.z);
}


Vector.copy = function(vector) {
    return new Vector(vector.x, vector.y, vector.z);
}


Vector.cross = function(a, b) {
  return new Vector(
    a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x
  );
}


Vector.divide = function(a, b) {
  return new Vector(a.x / b.x, a.y / b.y, a.z / b.z);
}


Vector.dot = function(a, b) {
  return (a.x * b.x + a.y * b.y + a.z * b.z);
}


Vector.multiply = function(a, b) {
  return new Vector(a.x * b.x, a.y * b.y, a.z * b.z);
}


Vector.scale = function(vector, scalar) {
  return new Vector(vector.x * scalar, vector.y * scalar, vector.z * scalar);
}


Vector.subtract = function(a, b) {
  return new Vector(a.x - b.x, a.y - b.y, a.z - b.z);
}
