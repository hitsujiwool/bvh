# BVH Parser in JavaScript

## Usage

    BVH.read(pathToBVHFile, function(motion) {
		
		// basic infomation of BVH motion data.
		motion.frameTime
		motion.numFrames
		
		// get a node by id.
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
		
		// node adjacent to "End Site" has properties about endOffset.
		if (node.hasEnd) {
			node.endOffsetX
			node.endOffsetY
			node.endOffsetZ
		}
    });
