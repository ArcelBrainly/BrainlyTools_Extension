"use strict";
import ext from "../utils/ext";

let prepareAjax = () => {
	$(document).ajaxSend(function(xhr, s, settings) {
		if (typeof settings.data === "string") {
			settings.data = settings.data.replace(/(\&data\%5B\_Token\%5D\%5Block\%5D\=.+)/, "");
		}
	});

	prepareAjax = null;
}
let holdRequests = [];
const Request = {
	Brainly(options) {
		let that = this;
		let { method, path, data, callback, countErr = 0, tryAgain } = options;
		let reqData = {
			method: method,
			type: method,
			url: path,
			headers: {
				"Content-Type": "application/json",
				"X-B-Token-Long": System.data.Brainly.tokenLong,
				accept: "text/plain, */*; q=0.01"
			},
			data
		};

		if (typeof callback == "object") {
			reqData.success = callback.success;
		}

		if (options.ajaxOptions) {
			reqData = { ...reqData, ...options.ajaxOptions }
		}

		prepareAjax && prepareAjax();

		let ajaxR = $.ajax(reqData);

		tryAgain && console.log("tryAgain:", countErr);
		ajaxR.fail(function(e) {
			if (e.getResponseHeader("cf-chl-bypass") == "1") {
				callback.forceStop && callback.forceStop();
				holdRequests.push({ method, path, data, callback, onError, countErr, tryAgain: true });
				System.toBackground("openCaptchaPopup", System.data.meta.location.origin, res => {
					if (res == "true") {
						holdRequests.forEach(holding => {
							that.Brainly(holding);
						});

						holdRequests = [];

						callback.forceStop && callback.forceStop(true);
					}
				});
			} else if (++countErr < 3) {
				setTimeout(() => that.Brainly({ method, path, data, callback, onError, countErr, tryAgain: true }), 500);
			} else {
				if (typeof onError === "function") {
					onError(e);
				}
				if (typeof callback.error === "function") {
					callback.error(e);
				}
				reqData.countErr = 0;
			}
		});
		return ajaxR;
	},
	BrainlyAPI(method, path, data) {
		//return new Promise((resolve, reject) => {
		let requestData = {
			method,
			path: System.data.Brainly.apiURL + path,
			ajaxOptions: {
				dataType: "json"
			}
		};

		if (data) {
			requestData.data = JSON.stringify(data);
		}

		return this.Brainly(requestData); //.then(resolve).catch(reject);
		//});
	},
	get(path) {
		return new Promise(function(resolve, reject) {
			let xhr = new XMLHttpRequest();

			xhr.open("GET", path, true);
			xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');

			xhr.onload = function() {
				if (xhr.readyState == 4 && (xhr.status == 201 || xhr.status == 200)) {
					if (xhr && xhr.responseText) {
						resolve(xhr.responseText)
					} else {
						resolve(null)
					}
				} else {
					console.log(xhr.readyState, xhr.status);
					resolve(null)
				}
			}
			xhr.onerror = function() {
				reject({
					status: this.status,
					statusText: xhr.statusText
				});
			};

			xhr.send();
		});
	},
	BrainlySaltGet(path, data) {
		let that = this;

		var xhr = new XMLHttpRequest();

		return $.ajax({
			method: "get",
			url: System.data.meta.location.origin + path,
			beforeSend: function(xhr) {
				xhr.setRequestHeader('X-Requested-With', { toString: function() { return ''; } });
			},
			xhr: () => xhr,
			success: (data, textStatus, jqXHR) => {
				jqXHR.responseURL = xhr.responseURL;
				//callback && callback(data, textStatus, jqXHR);
			}
		});
	},
	ExtensionServer(method, path, data) {
		return new Promise((resolve, reject) => {
			if (data) {
				data = JSON.stringify(data);
			}

			let messageData = {
				action: "xmlHttpRequest",
				method,
				path,
				data,
				headers: {
					"Content-type": "application/json; charset=utf-8"
				}
			};

			if (System.data.Brainly.userData.extension && System.data.Brainly.userData.extension.secretKey) {
				messageData.headers["SecretKey"] = System.data.Brainly.userData.extension.secretKey;
			}

			ext.runtime.sendMessage(System.data.meta.extension.id, messageData, req => {
				if (req.success) {
					resolve(req.res)
				} else if (req.error) {
					resolve()
				}
			});
		});
	}
}
export default Request;
