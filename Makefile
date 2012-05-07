build:
	@./node_modules/.bin/browserbuild \
		-g BVH \
		-m index -b lib/ \
		lib > dist/bvh.js
