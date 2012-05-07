var bvh = require('../lib'),
    BVH = require('../lib/bvh'),
    BVHNode = require('../lib/bvh_node'),
    Parser = require('../lib/parser'),
    connect = require('connect'),
    app = connect.createServer(connect.static(__dirname));

app.listen(8383);

describe('bvh.js', function() {
  it('should expose .read()', function() {
    bvh.read.should.be.a('function');
  });
  
  it('should expose .parse()', function() {
    bvh.parse.should.be.a('function');
  });
  
  it('should read remote bvh file using xhr', function(done) {
    bvh.read('http://127.0.0.1:8383/fixtures/A_test.bvh', function(motion) {
      motion.should.be.instanceof(BVH);
      done();
    });
  });
});

describe('Parser', function() {
  // TODO: put test for Parser
  it('should pass test', function(done) {
    done();
  });
});

describe('BVH', function() {
  var str = require('fs').readFileSync(__dirname + '/fixtures/A_test.bvh').toString('utf-8'),
      motion = bvh.parse(str);
  
  it('should be instance of BVH', function() {
    motion.should.be.instanceof(BVH);
  });
  
  it('should expose .at()', function() {
    motion.at.should.be.a('function');
  });
  
  it('should expose .of()', function() {
    motion.of.should.be.a('function');
  });
  
  it('should have frameTime', function() {
    motion.should.have.property('frameTime');
  });

  it('should have numFrames', function() {
    motion.should.have.property('numFrames');
  });
  
  describe('nodeList', function() {
    var nodeList = motion.nodeList;
    
    it('should be instance of Array', function() {
      nodeList.should.be.instanceof(Array);
    });
  });
  
  describe('node', function() {
    var head = motion.of('Head');
    
    it('should instance of BVHNode', function() {
      head.should.be.instanceof(BVHNode);
    });
  });
});