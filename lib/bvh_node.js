module.exports = BVHNode;

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
