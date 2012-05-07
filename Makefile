REPORTER = spec

all: build build-min

build:
	@./node_modules/.bin/browserbuild \
		-g BVH \
		-m index -b lib/ \
		lib > dist/bvh.js

build-min: build
	@cat dist/bvh.js | ./node_modules/.bin/uglifyjs > dist/bvh.min.js

test:
	@./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER)

.PHONY: all build build-min test
