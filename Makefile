run: 
	cordova run browser

build: 
	cordova build

builds: 
	cordova build android --release -- --packageType=apk

plugin: 
	cordova plugin ls
	
go: 
	docker exec -it cordova bash

