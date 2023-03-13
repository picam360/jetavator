#! /usr/bin/env node
process.chdir(__dirname);

const fs = require("fs");
const rimraf = require("rimraf");
const rcopy = require('recursive-copy');
const { execSync } = require('child_process');

try{
	rcopy('./pserver/www', './node_modules/node-pserver/www', { overwrite: true },function (err) {
		if (err) {
			throw(err);
		}
	});
}catch(err){
	console.log("error on cp ./pserver/www/* ./node_modules/node-pserver/www/:" + err);
}
