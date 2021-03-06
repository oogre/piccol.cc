#!/usr/bin/env node

/*----------------------------------------*\
  readWiki - main.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2020-10-26 14:15:32
  @Last Modified time: 2020-11-25 19:27:35
\*----------------------------------------*/

import {OAuth} from "oauth";
import Tumblr from "tumblrwks";
import fs from "fs";
import Imgbb from "imgbbjs";
import Express from "express";
import fileUpload from 'express-fileupload';
import {promisify} from "util";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const exists = promisify(fs.exists);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const readDir = promisify(fs.readdir);
const mkdir = promisify(fs.mkdir);

const app = Express()

app.use(bodyParser.json());
app.use(fileUpload());
app.use(bodyParser.urlencoded({extended: true}));
app.use(Express.static("client"));

const APIEntries = [{
	route : "/favicon.ico",
	type : "GET",
	action : async (req, res)=>{}
},{
	route : "/init",
	type : "POST",
	action : async ({body}, res) => {
		let {boardName, imgbbKey} = body;
		boardName = decodeURIComponent(boardName);
		//if(APIEntries.map(({route})=> route.substr(1)).includes(boardName) ){
		//	res.setHeader('Content-Type', 'application/json');
		//	return res.end(JSON.stringify({ success: false }));
		//}

		const isBoardExist = await exists(`${process.env.PWD}/boards/${boardName}`);
		if(isBoardExist){
			res.setHeader('Content-Type', 'application/json');
			return res.end(JSON.stringify({ success: false }));
		}
		const imgbb = new Imgbb({ key: imgbbKey });
		const photo = await readFile(`${process.env.PWD}/public/test.jpg`, "base64");
		const {success} = await imgbb.upload(photo, null, 60);
		if(success){
			await mkdir(`${process.env.PWD}/boards/${boardName}`);
			await writeFile(`${process.env.PWD}/boards/${boardName}/imgbbKey`, imgbbKey);
			await writeFile(`${process.env.PWD}/boards/${boardName}/content.json`, JSON.stringify([]));
			res.setHeader('Content-Type', 'application/json');
	    	return res.end(JSON.stringify({ success: true }));
		}
		res.setHeader('Content-Type', 'application/json');
		return res.end(JSON.stringify({ success: false }));
	}
},{
	route : '/list',
	type : "GET",
	action : async (req, res) => {
		const boardList = async ()=>{
			const rawContent = await readDir(`${process.env.PWD}/boards`);
			return await Promise.all(
				rawContent
				.map(async boardName => {
					let lastUpdate = 0;
					const isLastUpdateExist = await exists(`${process.env.PWD}/boards/${boardName}/lastUpdate`);
					if(isLastUpdateExist) lastUpdate = await readFile(`${process.env.PWD}/boards/${boardName}/lastUpdate`, "utf8");
					return {
						boardName,
						lastUpdate : parseInt(lastUpdate)
					}
				})
			);
		}
		const rawContent = (await boardList()).sort((a, b)=>a.lastUpdate<b.lastUpdate).map(({boardName})=>boardName);
		res.setHeader('Content-Type', 'application/json');
		return res.end(JSON.stringify({ 
			success: true, 
			content : rawContent 
		}));
	}
},{
	route : '/add',
	type : "POST",
	action : async (req, res) => {
		const {files} = req;
		let {boardName} = req.body;
		boardName = decodeURIComponent(boardName);
		const imgbb = new Imgbb({ key: await readFile(`${process.env.PWD}/boards/${boardName}/imgbbKey`) });
		const data = await imgbb.upload(files.file.data.toString('base64'), null);
		if(data.success){
			const img = data.data;
			const rawContent = await readFile(`${process.env.PWD}/boards/${boardName}/content.json`);
			const content = JSON.parse(rawContent) || [];
			content.unshift(data);
			await writeFile(`${process.env.PWD}/boards/${boardName}/lastUpdate`, Date.now());
			await writeFile(`${process.env.PWD}/boards/${boardName}/content.json`, JSON.stringify(content, null, '\t'));
			res.setHeader('Content-Type', 'application/json');
	    	return res.end(JSON.stringify({ 
	    		success: true,  
	    		content : {
					id : img.id, 
					image : {
						fullSize : img.image.url,
						medium : img.medium?.url || img.image.url
					}
				}
	    	}));
		}
		res.setHeader('Content-Type', 'application/json');
		return res.end(JSON.stringify({ success: false }));
	}
},{
	route : '/remove',
	type : "POST",
	action : async ({body}, res) => {
		let {id, boardName} = body;
		boardName = decodeURIComponent(boardName);
		const rawContent = await readFile(`${process.env.PWD}/boards/${boardName}/content.json`);
		const content = JSON.parse(rawContent) || [];
		const elementId = content.findIndex(({data}) => data.id === id);
		if(elementId > -1){
			content.splice(elementId, 1);
			await writeFile(`${process.env.PWD}/boards/${boardName}/content.json`, JSON.stringify(content, null, '\t'));
			const {delete_url} = content.find(({data}) => data.id === id).data;
			fetch(delete_url)
			.catch(error=> console.log(error));
		}
		res.setHeader('Content-Type', 'application/json');
		return res.end(JSON.stringify({ success: true }));
	}
},{
	route : '/content',
	type : "GET",
	action : async ({query}, res) => {
		let {boardName} = query;
		boardName = decodeURIComponent(boardName);
		const isBoardExist = await exists(`${process.env.PWD}/boards/${boardName}`);
		if(isBoardExist){
			const rawContent = await readFile(`${process.env.PWD}/boards/${boardName}/content.json`);
			const content = JSON.parse(rawContent);
			if(content){
				res.setHeader('Content-Type', 'application/json');
		    	return res.end(JSON.stringify({ 
		    		success: true, 
					content : content.map(({data}) => {
						return {
							id : data.id, 
							image : {
								fullSize : data.image.url,
								medium : data.medium?.url || data.image.url
							}
						}
					})
		    	}));
			}
		}
		res.setHeader('Content-Type', 'application/json');
		return res.end(JSON.stringify({ success: false }));
	}
},{
	route : "*",
	type : "GET",
	action : async ({url}, res)=> {
		const boardName = decodeURIComponent(url).substring(1);
		if(boardName){
			const isBoardExist = await exists(`${process.env.PWD}/boards/${boardName}`);
			if(isBoardExist) return res.sendFile(`${process.env.PWD}/client/ui/board.html`);
			return res.sendFile(`${process.env.PWD}/client/ui/initialization.html`);
		}
		return res.sendFile(`${process.env.PWD}/client/ui/index.html`)
	}
}]

APIEntries.map(({route, type, action})=>{
	if(type === "POST"){
		app.post(route, action);
	}
	else if(type === "GET"){
		app.get(route, action);
	}
});

const main = async ()=>{
	const isBoardExist = await exists(`${process.env.PWD}/boards`);
	if(!isBoardExist){
		await mkdir(`${process.env.PWD}/boards`);
	}
	app.listen(8080)
}
main();

