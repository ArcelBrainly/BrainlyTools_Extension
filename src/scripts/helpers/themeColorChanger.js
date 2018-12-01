"use strict";

import WaitForElement from "./WaitForElement";
import MakeExpire from "./MakeExpire";

export default async color => {
	let rainbow = false;
	let localStoredColor = localStorage.getItem("themeColor");

	if (color != localStoredColor) {
		localStorage.setItem("themeColor", color);
	}

	if (color.indexOf(",") >= 0) {
		rainbow = true;
	}

	let personalColors = `
	.sg-header__container,
	.sg-button-primary--alt,
	.sg-button-secondary--alt,
	.mint-tabs__tab--active,
	#html .mint .mint-header,
	#html .mint #tabs-doj #main_menu>li.active,
	#html .mint #footer,
	.sg-box--blue {
		${!rainbow ? "background-color: " + color + ";" : "background-image: linear-gradient(to right, " + color + "); color: #fff;"}
	}
	
	.sg-link:not([class*="gray"]):not([class*="light"]):not([class*="mustard"]):not([class*="peach"]),
	#html .mint #profile #main-left .personal_info .helped_subjects>li,
	#html .mint #profile #main-left .personal_info .helped_subjects>li .bold,
	#html .mint #profile #main-left .personal_info .helped_subjects>li .bold a,
	#html .mint #profile #main-left .personal_info .helped_subjects>li .green{
		color: ${color};
	}

	.sg-button-secondary--alt-inverse {
		color: ${color};
		fill: ${color};
	}
	`;
	let head = await WaitForElement("head");

	if (head) {
		head = head[0];
		let $personalColors = document.getElementById("personalColors");

		if ($personalColors) {
			$personalColors.innerHTML = personalColors;
		} else {
			//head.innerHTML += `<style id="personalColors">${personalColors}</style>`;
			$personalColors = document.createElement('style');
			$personalColors.type = 'text/css';
			$personalColors.id = "personalColors"

			//var styles = `<style id="personalColors">${personalColors}</style>`;

			if ($personalColors.styleSheet) {
				$personalColors.styleSheet.cssText = personalColors;
			} else {
				$personalColors.appendChild(document.createTextNode(personalColors));
			}

			head.appendChild($personalColors);

		}
		
		let _loop_personalColors_expire = MakeExpire(6);
		let _loop_personalColors = setInterval(() => {
			if (_loop_personalColors_expire < new Date().getTime()) {
				clearInterval(_loop_personalColors);
			}

			$personalColors.parentNode && $personalColors.parentNode.appendChild($personalColors);
		});
	}
}
