var G = 6.67e-11;
var M = 5.972e24;
var R = 6371000;

function Satellite(orbitalRadius, inclination, ascension, type) {
  Entity.call(this, 0, 0, 0);

  this.orbitalRadius = orbitalRadius;
  this.angle = 0;
  this.cycles = 0;

  this.setInclination(inclination);
  this.setAscension(ascension);

  this.type = type;
}

Satellite.prototype = Object.create(Entity.prototype);
Satellite.prototype.constructor = Satellite;


Satellite.PLATFORM = "platform";
Satellite.DEBRIS = "debris";
Satellite.SATELLITE = "satellite";
Satellite.INTERCEPTOR = "interceptor";

Satellite.FACTOR = 400000;


Satellite.prototype.setInclination = function(inclination) {
  this.inclination = inclination % 180;
  this.setRotation(-90 + this.inclination, this.ascension, 0);
}


Satellite.prototype.setAscension = function(ascension) {
  this.ascension = ascension;
  this.setRotation(-90 + this.inclination, this.ascension, 0);
}


// Satellite.prototype.getWorldPosition = function(point) {
//   var r = this.getRotationMatrix();
//   var p = r.multiplyPoint(p);
//   p.scale(satellite.orbitalRadius);
//   return p;
// }


Satellite.prototype.getWorldOrbitPosition = function(angle) {
  var p = new Vector(Math.cos(angle * RAD), Math.sin(angle * RAD), 0);
  var r = this.getRotationMatrix();
  p = r.multiplyPoint(p);
  p.scale(this.orbitalRadius);
  return p;
}


// returns: altitude in metres
Satellite.prototype.getAltitude = function() {
  return ((this.orbitalRadius - 1) * R + Satellite.FACTOR);
}


// returns: orbital period in seconds
Satellite.prototype.getOrbitalPeriod = function() {
  var radius = (this.orbitalRadius) * R + Satellite.FACTOR;
  return (2 * Math.PI * Math.sqrt(Math.pow(radius, 3) / (G * M)));
}


// returns: orbital velocity in metres per second
Satellite.prototype.getOrbitalVelocity = function() {
  var period = this.getOrbitalPeriod();
  var radius = (this.orbitalRadius) * R + Satellite.FACTOR;
  if (period != 0) {
    return (2 * Math.PI * (radius / period));
  } else {
    return 0;
  }
}
