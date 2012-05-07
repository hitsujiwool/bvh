# BVH Parser written in JavaScript

## Usage

```javascript
BVH.read(pathToBVHFile, function(motion) {
  // basic infomation about motion data
  motion.frameTime
  motion.numFrames

  // get lists of nodes
  motion.nodeList

  // get a node by id
  var node = motion.of('Head')
	
  // change node's internal state to n-th frame.
  node.at(4)

  // you can exchage the order of method "at" and "of"
  var state = motion.at(4)

  // this method also returns node
  state.of('Head')

  // node properties
  node.offsetX
  node.offsetY
  node.offsetZ
  node.rotationX
  node.rotationY
  node.rotationZ

  // node adjacent to "End Site" has properties about endOffset
  if (node.hasEnd) {
    node.endOffsetX
    node.endOffsetY
    node.endOffsetZ
  }
});
```

## License

(The MIT License)

Copyright (c) 2012 hitsujiwool <utatanenohibi@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
