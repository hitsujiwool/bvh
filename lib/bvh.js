module.exports = BVH;

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