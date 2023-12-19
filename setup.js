#! /usr/bin/env node
process.chdir(__dirname);

const fs = require("fs");
const { execSync } = require('child_process');

try{
	var src = `${__dirname}/pserver/plugins/jetavator/config.json.tmp`;
	var dst = `${__dirname}/pserver/plugins/jetavator/config.json`;
	if (!fs.existsSync(dst)) {
		execSync(`cp ${src} ${dst}`, {cwd : __dirname});
	}
}catch(err){
	console.log("error on copy pserver config:" + err);
}

try{
	var src = `${__dirname}/pserver/plugins/jetavator`;
	var dst = `${__dirname}/node_modules/node-pserver/plugins/jetavator`;
	if (fs.existsSync(dst)) {
		execSync(`rm ${dst}`, {cwd : __dirname});
	}
	execSync(`ln -s ${src} ${dst}`, {cwd : __dirname});
}catch(err){
	console.log("error on symlink pserver plugin:" + err);
}

try{
	var src = `${__dirname}/pviewer/plugins/jetavator`;
	var dst = `${__dirname}/node_modules/node-pserver/www/plugins/jetavator`;
	if (fs.existsSync(dst)) {
		execSync(`rm ${dst}`, {cwd : __dirname});
	}
	execSync(`ln -s ${src} ${dst}`, {cwd : __dirname});
}catch(err){
	console.log("error on symlink pviewer plugin:" + err);
}
