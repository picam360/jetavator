#! /usr/bin/env node
process.chdir(__dirname);

const fs = require("fs");
const rimraf = require("rimraf");
const rcopy = require('recursive-copy');
const { execSync } = require('child_process');

try{
	execSync(`ln -s ${__dirname}/pserver/plugins/jetavator ${__dirname}/node_modules/node-pserver/plugins/jetavator`, {cwd : __dirname});
}catch(err){
	console.log("error on symlink pserver plugin:" + err);
}

try{
	execSync(`ln -s ${__dirname}/pviewer/plugins/jetavator ${__dirname}/node_modules/node-pserver/www/plugins/jetavator`, {cwd : __dirname});
}catch(err){
	console.log("error on symlink pviewer plugin:" + err);
}
