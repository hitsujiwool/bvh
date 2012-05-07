REPORTER = spec

build:
	@./node_modules/.bin/browserbuild \
		-g BVH \
		-m index -b lib/ \
		lib > dist/bvh.js

test:
	@./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER)

.PHONY: build test