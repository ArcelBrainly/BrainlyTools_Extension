import ext from "./utils/ext";
import Inject2body from "./helpers/Inject2body";
//import WaitForElm from "./helpers/WaitForElm";
import themeColorChanger from "./helpers/themeColorChanger";
import messagesLayoutExtender from "./helpers/messagesLayoutExtender";
import _System from "./controllers/System";

let manifest = ext.runtime.getManifest();
manifest.URL = ext.extension.getURL("");
manifest.id = ext.runtime.id;
manifest.clientID = Math.random().toString(36).slice(2);

let System = new _System();
System.data.meta.marketName = location.hostname;
System.data.meta.manifest = manifest;

System.data.meta.marketTitle = document.title;
System.data.meta.extension = {
	id: ext.runtime.id,
	URL: ext.runtime.getURL("").replace(/\/$/, "")
}
window.System = System;
System.changeBadgeColor("loading");

require("./helpers/preExecuteScripts")();

Inject2body("/scripts/helpers/prototypeOverrides.js");
Inject2body(["/scripts/views/0-Core/index.js", "/scripts/views/0-Core/Core.css"]);

/*

*/
var extractTags = () => {
	var url = document.location.href;
	if (!url || !url.match(/^http/)) return;

	var data = {
		title: "",
		description: "",
		url: document.location.href
	}

	var ogTitle = document.querySelector("meta[property='og:title']");
	if (ogTitle) {
		data.title = ogTitle.getAttribute("content")
	} else {
		data.title = document.title
	}

	var descriptionTag = document.querySelector("meta[property='og:description']") || document.querySelector("meta[name='description']")
	if (descriptionTag) {
		data.description = descriptionTag.getAttribute("content")
	}

	return data;
}

function onRuntimeHandler(request, sender, sendResponse) {
	if (request.action === 'process-page') {
		sendResponse(extractTags())
	}
	if (request.action == "manifest") {
		sendResponse(manifest);
	}
	if (request.action === "changeColor") {
		themeColorChanger(request.data);
	}
	if (request.action === "shareGatheredData2Background") {
		window.postMessage({
			action: 'shareGatheredData2Background'
		}, request.url);

		window.addEventListener('shareGatheredData2BackgroundDone', e => {
			//sendResponse("sharingDone");
		});
	}
	if (request.action === "extendMessagesLayout") {
		messagesLayoutExtender(request.data);
	}
}
ext.runtime.onMessage.addListener(onRuntimeHandler);

window.addEventListener('metaGet', e => {
	window.postMessage({
			action: 'metaSet',
			data: System.data.meta
		},
		e.target.URL);
});
