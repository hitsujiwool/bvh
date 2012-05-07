all: build build-min

build:
	@./node_modules/.bin/browserbuild \
		-g BVH \
		-m index -b lib/ \
		lib > dist/bvh.js

build-min: build
	@cat dist/bvh.js | uglifyjs > dist/bvh.min.js
