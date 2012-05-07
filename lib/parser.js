var BVHNode = require('./bvh_node');

module.exports = Parser;

function Parser(lines) {
  this._lines = lines;
  this._lineNumber = -1;
  this.currentNode = null;
  this.next();
};
  
Parser.prototype.parse = function() {
  this
    .expect('HIERARCHY')
    .root()
    .motion();
  if (this.get()) throw new Error('Parse error: Invalid token ' + this.get() + '.');
  return this;
};
  
Parser.prototype.root = function() {
  var that = this,
      node;
  this
    .expect('ROOT', function(line) {
      var nodeName = line.split(' ')[1];
      node = new BVHNode(nodeName);
      that.currentNode = node;
    })
    .expect('{')
    .offset()
    .channels();
  while (this.accept('JOINT')) {
    this.joint();
    this.currentNode = node;
  }
  if (this.accept('End')) this.end();
  this.expect('}');
  return this;
};

Parser.prototype.joint = function() {
  var that = this,
      node;
  this
    .expect('JOINT', function(line) {
      var nodeName = line.split(' ')[1];
      node = new BVHNode(nodeName);
      node.parent = that.currentNode;
      that.currentNode.children.push(node);
      that.currentNode = node;
    })
    .expect('{')
    .offset()
    .channels();
  while (this.accept('JOINT')) {
    this.joint();
    this.currentNode = node;
  }
  if (this.accept('End')) this.end();
  this.expect('}');
  return this;
};

Parser.prototype.end = function() {
  if (this.get(0) !== 'End Site') throw new Error('Parse error: End Site expected, but ' + this.get() + '.');
  this
    .next()
    .expect('{')
    .endOffset()
    .expect('}');
  return this;
};

Parser.prototype.offset = function() {
  var offsets = this.get().split(' ').slice(1);
  if (offsets.length !== 3) throw new Error('Parse error: Invalid offset number.');
  this.currentNode.offsetX = +offsets[0];
  this.currentNode.offsetY = +offsets[1];
  this.currentNode.offsetZ = +offsets[2];
  return this.next();
};

Parser.prototype.endOffset = function() {
  var offsets = this.get().split(' ').slice(1);
  if (offsets.length !== 3) throw new Error('Parse error: Invalid offset number.');
  this.currentNode.hasEnd = true;
  this.currentNode.endOffsetX = +offsets[0];
  this.currentNode.endOffsetY = +offsets[1];
  this.currentNode.endOffsetZ = +offsets[2];
  return this.next();
};

Parser.prototype.channels = function() {
  var pieces = this.get(0).split(' '),
      n = parseInt(pieces[1], 10),
      channels = pieces.slice(2);
  if (n !== channels.length) throw new Error('Parse error: ' + n + ' expected for number of channels, but ' + channels.length + '.');
  this.currentNode.channels = channels;
  return this.next();
};

Parser.prototype.motion = function() {
  this._nodeList = this.currentNode.flatten();
  this
    .expect('MOTION')
    .frames()
    .frameTime();
  for (var i = 0, len = this.numFrames; i < len; i++) {
    this.frameValues();
  }
  return this;
};
  
Parser.prototype.frames = function() {
  var match = /^Frames:\s+(\d+)\s*$/.exec(this.get());
  if (match !== null) {
    this.numFrames = +match[1];
  } else {
    throw new Error('Parse error: Cannot find valid number of frames');
  }
  return this.next();
};

Parser.prototype.frameTime = function() {    
  var match = /^Frame Time:\s+([0-9.]+)$/.exec(this.get());
  if (match !== null) {
    this.frameTime = +match[1];
  } else {
    throw new Error('Parse error: Cannot find valid frametime');
  }
  return this.next();
};

Parser.prototype.frameValues = function() {
  var values = this.get().split(' '),
      that = this;
  this._nodeList.forEach(function(node) {
    if (values.length < node.channels.length) throw new Error('Parse error: Too short motion values per frame'); 
    node.frames.push(values.splice(0, node.channels.length).map(function(str) { return +str; }));
  });
  if (values.length > 0) throw new Error('Parse error: Too much motion values per frame');
  return this.next();
};

Parser.prototype.expect = function(state, callback) {
  if (this.accept(state)) {     
    if (callback) callback(this.get());
    return this.next();
  } else {
    throw new Error('Parse error: Unexpected token ' + this.get() + ' for ' + state);
  }
};

Parser.prototype.accept = function(state) {
  var line = this.get();
  if (line === undefined) return false;
  return line.split(' ')[0] == state;
};

Parser.prototype.next = function() {
  do {
    this._lineNumber++;
  } while (this.get() === '')
  return this;
};

Parser.prototype.get = function() {
  if (typeof this._lines[this._lineNumber] === 'undefined') {
    return undefined;
  } else {
    return this._lines[this._lineNumber].replace(/(^\s+)|(\s+$)/g, "");
  }
};
