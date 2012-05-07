var Parser = require('./parser'),
    BVHNode = require('./bvh_node'),
	BVH = require('./bvh');

exports.Parser = Parser;
exports.BVHNode = BVHNode;
exports.BVH = BVH;

function getXHR() {
  // if node
  var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
  return new XMLHttpRequest();
  // end
  if (window.XMLHttpRequest
    && ('file:' != window.location.protocol || !window.ActiveXObject)) {
    return new XMLHttpRequest();
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
}

exports.read = function(url, callback) {
  var xhr = getXHR();
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
