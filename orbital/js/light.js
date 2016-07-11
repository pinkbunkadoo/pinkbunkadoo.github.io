
function Light(x, y, z) {
  Entity.call(this, x, y, z);

  this.direction = new Vector();
}

Light.prototype = Object.create(Entity.prototype);
Light.prototype.constructor = Light;


Light.prototype.setDirection = function(x, y, z) {
  this.direction = new Vector(x, y, z);
  this.direction.normalize();
}
