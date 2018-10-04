"use strict"

import ext from "../utils/ext";
//import { storageS, storageL } from "./utils/storage";
import Storage from "../helpers/extStorage";
import Body from "./views/Body";
import renderLayout from "./views/Layout";
import renderError from "./views/Error";
import _System from "../controllers/System";

let System = new _System();
window.System = System;

$(() => {
	var messageDone = () => {
		messageDone = () => {};
		ext.runtime.sendMessage({ action: "getMarketData" }, function(res) {
			//console.log(res);
			if (res) {
				System.data = res;
				Storage.get(["user", "themeColor", "quickDeleteButtonsReasons", "extendMessagesBody"], res => {
					//console.log("storageUser: ", res);
					if (!(res && res.user && res.user.user && res.user.user.id && res.user.user.id == res.user.user.id)) {
						Body(renderError(`I'm unable to fetch your data from Brainly<br><br>Please go to Brainly's homepage or reload the page`));
					}
					if (!System.data.Brainly.deleteReasons.__withTitles) {
						Body(renderError("An error accoured while preparing the delete reasons and fetching from Brainly"));
					} else {
						Body(renderLayout(res));
					}
				});
			} else {
				Body(renderError());
			}
		});
	}

	ext.tabs.query({}, function(tabs) {
		for (var i = 0, tab; tab = tabs[i]; ++i) {
			if (System.regexp_BrainlyMarkets.test(tab.url)) {
				var message = { action: "shareGatheredData2Background", url: tab.url };
				ext.tabs.sendMessage(tab.id, message, res => {
					messageDone();
				});
			}
		}
	});
});
