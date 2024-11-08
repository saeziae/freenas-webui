build:
	export NODE_OPTIONS=--openssl-legacy-provider &&
	yarn install &&
	yarn run build:prod:aot
