var BVH = (function(exports) {

  function Parser(lines) {
    this._lines = lines;
    this._lineNumber = 0;
    this.currentNode = null;
  };
  
  Parser.prototype.parse = function() {    
    this
      .blank()
      .hierarchy();
    return this;
  };
  
  Parser.prototype.hierarchy = function() {
    this
      .expect('HIERARCHY')
      .root()
      .motion();
    return this;
  };

  Parser.prototype.blank = function() {
    while (this.accept('')) {
      this.next();
    }
    return this;
  };

  Parser.prototype.root = function() {
    var that = this,
        node;
    this
      .blank()
      .expect('ROOT', function(line) {
        var nodeName = line.split(' ')[1];
        node = new BVHNode(nodeName);
        that.currentNode = node;
      })
      .blank()
      .expect('{')
      .blank()
      .offset()
      .blank()
      .channels()
      .blank();
    while (this.accept('JOINT')) {
      this
        .joint()
        .blank();
      this.currentNode = node;
    }
    if (this.accept('End')) this.end();
    this
      .blank()
      .expect('}');
    return this;
  };

  Parser.prototype.joint = function() {
    var that = this,
        node;
    this
      .blank()
      .expect('JOINT', function(line) {
        var nodeName = line.split(' ')[1];
        node = new BVHNode(nodeName);
        node.parent = that.currentNode;
        that.currentNode.children.push(node);
        that.currentNode = node;
      })
      .blank()
      .expect('{')
      .blank()
      .offset()
      .blank()
      .channels()
      .blank();
    while (this.accept('JOINT')) {
      this
        .joint()
        .blank();
      this.currentNode = node;
    }
    if (this.accept('End')) this.end();
    this
      .blank()
      .expect('}');
    return this;
  };

  Parser.prototype.end = function() {
    this.blank();
    if (this.get(0) !== 'End Site') {
      throw new Error('Parse error: End Site expected, but ' + this.get() + '.');
    }
    this
      .next()
      .blank()
      .expect('{')
      .blank()
      .endOffset()
      .blank()
      .expect('}');
    return this;
  };

  Parser.prototype.offset = function() {
    var offsets = this.get().split(' ').slice(1);
    if (offsets.length !== 3) {
      throw new Error('Parse error: Invalid offset number.');
    }
    this.currentNode.offsetX = +offsets[0];
    this.currentNode.offsetY = +offsets[1];
    this.currentNode.offsetZ = +offsets[2];
    return this.next();
  };

  Parser.prototype.endOffset = function() {
    var offsets = this.get().split(' ').slice(1);
    if (offsets.length !== 3) {
      throw new Error('Parse error: Invalid offset number.');
    }
    this.currentNode.hasEnd = true;
    this.currentNode.endOffsetX = +offsets[0];
    this.currentNode.endOffsetY = +offsets[1];
    this.currentNode.endOffsetZ = +offsets[2];
    return this.next();
  };

  Parser.prototype.channels = function() {
    var pieces = this.get(0).split(' '),
        n = parseInt(pieces[1], 10),
        channels = pieces.slice(2),
        that = this;
    if (n !== channels.length) {
      throw new Error('Parse error: ' + n + ' expected for number of channels, but ' + channels.length + '.');
    }
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
    this.next();
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
      if (values.length < node.channels.length) {
        throw new Error('Parse error: Too short motion values per frame'); 
      }
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
    this._lineNumber++;
    return this;
  };

  Parser.prototype.get = function() {
    return this._lines[this._lineNumber].replace(/(^\s+)|(\s+$)/g, "");
  };

  function BVHNode(nodeName) {
    this.id = nodeName;
    this.children = [];
    this.parent = null;
    this.frames = [];
    this.channels = null;
    this.hasEnd = false;
  }

  BVHNode.prototype.at = function(nthFrame) {
    var that = this;
    nthFrame = nthFrame | 0;
    this.currentFrame = nthFrame;
    var frame = this.frames[nthFrame - 1];
    this.channels.forEach(function(channel, i) {
      var prop = channel.slice(1) + channel.slice(0, 1).toUpperCase();
      that[prop] = frame[i];
    });
    return this;
  };

  BVHNode.prototype.flatten = function() {
    function iter(node) {
      var tmp = [node];
      for (var i = 0, len = node.children.length; i < len; i++) {        
        tmp = tmp.concat(iter(node.children[i]));
      }
      return tmp;
    };
    return iter(this);
  };

  BVHNode.prototype.toString = function() {
    function iter(node, indent) {
      var tmp = [indent + '- ' + node.id];
      for (var i = 0, len = node.children.length; i < len; i++) {        
        tmp = tmp.concat(iter(node.children[i], indent + '   '));
      }
      return tmp;
    };
    return iter(this, '').join("\n");
  };

  function BVH(parser) {
    function iter(node, res) {
      if (res[node.id]) throw new Error('Error: Node ' + node.id + ' already exists');
      res[node.id] = node;
      for (var i = 0, len = node.children.length; i < len; i++) {
        iter(node.children[i], res);
      }
      return res;
    }
    this.root = parser.currentNode;
    this.numFrames = parser.numFrames;
    this.frameTime = parser.frameTime;
    this.nodeList = this.root.flatten();
    this._nodeIndex = iter(this.root, {});
  }
  
  BVH.prototype.at = function(nthFrame) {
    nthFrame = nthFrame | 0;
    for (var prop in this._nodeIndex) {
      this._nodeIndex[prop].at(nthFrame);
    }
    return this;
  };
  
  BVH.prototype.of = function(id) {
    return this._nodeIndex[id];
  };

  exports.read = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function() {
      callback(exports.parse(xhr.response));
    };
    xhr.send();
  };

  exports.parse = function(str) {
    var lines = str.replace("\r", '').split("\n");
    return new BVH((new Parser(lines)).parse());
  };

  return exports;

}({}));