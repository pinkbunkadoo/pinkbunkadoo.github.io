
function Mesh() {
  this.vertices = [];
  this.triangles = [];
  this.colors = [];
  this.normals = [];
  this.uvs = [];
}


Mesh.prototype.getBounds = function() {

  if (this.bounds === undefined) {
    var bbminx = Number.POSITIVE_INFINITY;
    var bbminy = Number.POSITIVE_INFINITY;
    var bbmaxx = Number.NEGATIVE_INFINITY;
    var bbmaxy = Number.NEGATIVE_INFINITY;

    for (var i = 0; i < this.vertices.length; i++) {
      var v = this.vertices[i];
      if (v.x < bbminx) bbminx = v.x;
      if (v.y < bbminy) bbminy = v.y;
      if (v.x > bbmaxx) bbmaxx = v.x;
      if (v.y > bbmaxy) bbmaxy = v.y;
    }

    this.bounds = new Rectangle(bbminx, bbminy, bbmaxx - bbminx + 1, bbmaxy - bbminy + 1);
  }

  return this.bounds;
}


Mesh.prototype.extractFaceParams = function(s, data) {
  var values = [];
  var f = s.split('/');

  for (var i = 0; i < f.length; i++) {
    if (isNaN(f[i])) {
      values[i] = null;
    } else {
      values[i] = parseInt(f[i]) - 1;
    }
  }

  if (values[0] !== undefined) data.vertices.push(values[0]);
  if (values[1] !== undefined) data.uvs.push(values[1]);
  if (values[2] !== undefined) data.normals.push(values[2]);
  if (values[3] !== undefined) data.colors.push(values[3]);
}


Mesh.fromOBJ = function(resource) {
  var mesh = new Mesh();
  var lines = resource.content.split('\n');

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();

    if (line[0] == "#") continue;

    var params = line.split(' ');
    var type = params[0];

    if (type == 'v') {
      mesh.vertices.push(new Vector(parseFloat(params[1]), parseFloat(params[2]), parseFloat(params[3])));
    } else if (type == 'vt') {
      mesh.uvs.push(new Vector(parseFloat(params[1]), parseFloat(params[2]), parseFloat(params[3])));
    } else if (type == 'vn') {
      mesh.normals.push(new Vector(parseFloat(params[1]), parseFloat(params[2]), parseFloat(params[3])));
    } else if (type == 'vc') {
      var r = parseFloat(params[1]);
      var g = parseFloat(params[2]);
      var b = parseFloat(params[3]);
      var a = (params[4] !== undefined ? parseFloat(params[4]) : 1);
      mesh.colors.push(new Color(r, g, b, a));
    } else if (type == 'f') {
      var data = {
        vertices: [],
        uvs: [],
        normals: [],
        colors: []
      };
      mesh.extractFaceParams(params[1], data);
      mesh.extractFaceParams(params[2], data);
      mesh.extractFaceParams(params[3], data);
      mesh.triangles.push(data);
    } else if (type == 'o') {
      mesh.vertices = [];
      mesh.triangles = [];
      mesh.colors = [];
      mesh.normals = [];
      mesh.uvs = [];
    }
  }

  return mesh;
}
