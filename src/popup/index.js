"use strict"

import ext from "../scripts/utils/ext";
import _System from "../scripts/controllers/System";
import Popup from "./controllers/Popup";
import CheckIfSameDomain from "../scripts/helpers/CheckIfSameDomain";

let System = new _System();
window.System = System;
window.isPageBusy = false;

window.onbeforeunload = function() {
	if (window.isPageBusy) {
		return System.data.locale.common.notificationMessages.ongoingProcess;
	}
}

$(onBodyLoad);
async function onBodyLoad() {
	window.popup = new Popup();

	System.data.locale = await System.prepareLangFile(navigator.language);

	popup.RenderStatusMessage({ title: `${System.data.locale.popup.notificationMessages.pleaseWait}..` });

	let isBrainlyPageFound = false;
	let tabs = await ext.tabs.query({});

	if (tabs && tabs.length > 0) {
		let activeBrainlyTab = tabs.find(tab => tab.active && System.constants.Brainly.regexp_BrainlyMarkets.test(tab.url));
		let tab = tabs.reduce((selectedTab, currentTab) => {
			let isCurrentTabBrainly = System.constants.Brainly.regexp_BrainlyMarkets.test(currentTab.url);

			if (
				isCurrentTabBrainly &&
				(
					!selectedTab ||
					(
						CheckIfSameDomain(selectedTab.url, currentTab.url) &&
						selectedTab.id < currentTab.id
					)
				)
			) {
				return currentTab
			}

			return selectedTab;
		}, activeBrainlyTab);

		if (tab) {
			isBrainlyPageFound = true;
			var message = { action: "contentscript>Share System.data to background.js", url: tab.url };

			try {
				await ext.tabs.sendMessage(tab.id, message);
			} catch (error) {
				await ext.runtime.sendMessage({ action: "background>Inject content script anyway", data: tab.id });
				ext.tabs.sendMessage(tab.id, message);
			}
		}
	}

	chrome.runtime.onMessage.addListener(function(request) {
		if (request.action == "popup>Get System.data from background") {
			popup.PrepareDataBeforeRendering();
		}
	});

	if (!isBrainlyPageFound) {
		popup.RenderStatusMessage({
			type: "danger",
			title: System.data.locale.popup.notificationMessages.errorN.replace("%{error_code}", ` 404 `),
			message: System.data.locale.popup.notificationMessages.openABrainlyPage
		});
	}
}
