import notification from "../../../components/notification";
import { AccountDeleteReport } from "../../../controllers/ActionsOfServer";
import JSZip from "jszip";
import Progress from "../../../components/Progress";

class AccountDeleteReporter {
	constructor() {
		this.evidencePool = {};
		this.svgPath = {
			close: `<path d="M38 12.83L35.17 10 24 21.17 12.83 10 10 12.83 21.17 24 10 35.17 12.83 38 24 26.83 35.17 38 38 35.17 26.83 24z"/>`,
			"delete": `<path d="M12 38c0 2 2 4 4 4h16c2 0 4-2 4-4V14H12v24zM38 8h-7l-2-2H19l-2 2h-7v4h28V8z"/>`
		}
		this.Render();
	}
	Render() {
		this.$evidences = $(`
		<div class="evidences">
			<div class="container">
				<label for="addFileInput">${System.data.locale.userProfile.accountDelete.evidences} <i>(${System.data.locale.userProfile.accountDelete.willBeReviewedByCommunityManager})</i></label>
				<div class="sg-content-box__content sg-content-box__content--spaced-top">
					<div class="sg-content-box addFile">
							<div class="sg-content-box__content sg-content-box__content--with-centered-text sg-content-box__content--spaced-top">
								<label class="sg-button-secondary sg-button-secondary--dark-inverse" for="addFileInput">
									<span class="sg-button-primary__icon">
										<div class="sg-icon sg-icon--adaptive sg-icon--x14">
											<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 32 32"><path fill="#333" d="M29.36 4.64a9 9 0 0 0-12.72 0L2.04 19.05a7 7 0 0 0 9.9 9.9l14.6-14.41a5 5 0 1 0-7.08-7.07L8.5 18.43a1 1 0 1 0 1.41 1.42L20.88 8.88a3 3 0 0 1 4.24 4.24L10.53 27.54a5 5 0 1 1-7.07-7.07L17.91 6.19a7 7 0 1 1 9.9 9.9L16.98 26.92a1 1 0 0 0 0 1.41 1 1 0 0 0 1.42 0l10.96-10.97a9 9 0 0 0 0-12.72z"/></svg>
										</div>
									</span>${System.data.locale.userProfile.accountDelete.addFiles}..</label>
								<input type="file" id="addFileInput" multiple>
							</div>
					</div>
				</div>
			</div>
			<div class="container textarea">
				<label for="comment">${System.data.locale.userProfile.accountDelete.yourComment} <i>(${System.data.locale.userProfile.accountDelete.willBeReviewedByCommunityManager})</i></label>
				<textarea name="comment" id="comment" style="margin-top: 3px;"></textarea>
			</div>
			<div class="container progress"></div>
		</div>`);

		this.$comment = $("textarea#comment", this.$evidences);
		this.$addFileButtonContainer = $("div.addFile", this.$evidences);
		this.$addFile = $(`#addFileInput`, this.$evidences);
		this.$progressHole = $(".container.progress", this.$evidences);

		this.progress = new Progress({
			type: "is-success",
			label: "",
			max: 100
		});

		this.$evidences.insertBefore(`#DelUserAddForm > div.submit`);
		this.BindEvents();
	}
	BindEvents() {
		let that = this;
		let $deleteForm = $(`#DelUserAddForm`);

		$deleteForm.on('submit', async function(e) {
			e.preventDefault();

			that.progress.$container.appendTo(that.$progressHole.html(""));

			let promise = that.PrepareForm_SendItToExtensionServer();
			let onError = () => {
				notification("I couldn't able report your delete request to community manager so I can't continue to delete. Sorry :/<br>If this error persist, ask for help from your extension manager", "error");
			}

			promise
				.catch(onError)
				.then(resAccountDeleteReport => {
					if (!resAccountDeleteReport || !resAccountDeleteReport.success) {
						return onError();
					}

					that.progress.updateLabel(System.data.locale.common.done);
					that.submit();
				});
		});

		this.$addFile.on("change", function() {
			that.ProcessFiles(this.files);
			this.value = "";
		});

		this.$evidences
			.on("click", ".evidence.previewable:not(.previewing) .sg-actions-list > div.sg-actions-list__hole:nth-child(n+2)", function() {
				let $parent = $(this).parents(".evidence");

				that.ShowPreview($parent)
			})
			.on("click", ".evidence button", function() {
				let $parent = $(this).parents(".evidence");

				if ($parent.is(".previewing")) {
					that.ClosePreview($parent);
				} else {
					that.RemoveListItem($parent);
				}
			});
	}
	ProcessFiles(files) {
		if (files && files.length > 0) {
			for (let i = 0, file;
				(file = files[i]); i++
			) {
				this.ProcessFile(file);
			};
		}
	}
	ProcessFile(file) {
		if (file.size > System.data.config.MAX_FILE_SIZE_OF_EVIDENCE) {
			notification(System.data.locale.userProfile.notificationMessages.fileSizeExceeded.replace("%{file_name}", file.name).replace("%{file_size}", `${System.data.config.MAX_FILE_SIZE_OF_EVIDENCE_IN_MB} MB`));
		} else {
			let fileExtension = file.name.split('.').pop();
			let isShortcut = /lnk|url|xnk/.test(fileExtension);

			if (!isShortcut || confirm(System.data.locale.userProfile.notificationMessages.aShortcutFile)) {
				let evidenceId = `${Date.now()}_${System.randomNumber(0,9999)}`;

				this.evidencePool[evidenceId] = {
					file,
					element: this.RenderEvidence(file, evidenceId)
				};
			}
		}
	}
	RenderEvidence(file, evidenceId) {
		let icon = this.RenderSVGIcon(file, evidenceId);

		let $element = $(`
		<div class="sg-content-box sg-content-box--full evidence" data-evidenceid="${evidenceId}">
				<div class="sg-content-box__content sg-content-box__content--spaced-top-small">
						<div class="sg-actions-list">
								<div class="sg-actions-list__hole">
										<button class="sg-button-secondary sg-button-secondary--small sg-button-secondary--peach"><svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 50 50" fill="ffffff">${this.svgPath.delete}</svg></button>
								</div>
								<div class="sg-actions-list__hole sg-actions-list__hole--grow sg-text--to-right">
									<span class="sg-text sg-text--small sg-text--gray sg-text--bold" title="${file.name}">${file.name.replace(/[\s|⠀]{2,}/gm," ").trim()}</span>
								</div>
								<div class="sg-actions-list__hole">
									<div class="sg-icon sg-icon--x32">
										<img class="sg-avatar__image" src="${icon}">
									</div>
								</div>
						</div>
				</div>
		</div>`);

		$element.insertBefore(this.$addFileButtonContainer);

		return $element;
	}
	RenderSVGIcon(file, evidenceId) {
		let fileType = file.type.split("/");
		let iconFileType = "file";

		if (fileType[0] == "image") {
			iconFileType = "image";
			this.ReadFile(iconFileType, file, evidenceId);
		} else if (fileType[0] == "audio") {
			iconFileType = "audio";
		} else if (fileType[0] == "video") {
			iconFileType = "video";
			this.ReadFile(iconFileType, file, evidenceId);
		} else if (fileType[1] == "pdf") {
			iconFileType = "pdf";
		}

		iconFileType = `${System.data.meta.extension.URL}/images/fileIcons/${iconFileType}.svg`;

		return iconFileType;
	}
	ReadFile(type, file, evidenceId) {
		let reader = new FileReader();

		reader.onprogress = event => {
			if (event.lengthComputable) {
				let percentLoaded = Math.round((event.loaded / event.total) * 100);

				if (percentLoaded <= 100) {
					let w = 100 - percentLoaded;
					let $element = this.evidencePool[evidenceId].element;

					$element.css("background", `-webkit-linear-gradient(left, rgba(0, 0, 0, 0.${w + 10}) ${percentLoaded}%, white ${w}%)`);
				}
			}
		};
		reader.onload = event => this.ReaderOnLoad({ base64File: event.target.result, type, evidenceId });

		reader.readAsDataURL(file);
	}
	ReaderOnLoad({ base64File, type, evidenceId }) {
		let $element = this.evidencePool[evidenceId].element;
		let $img = $("img", $element);

		if (!base64File) {
			return false;
		}

		$element.addClass("previewable");

		if (type == "image") {
			$img
				.attr("src", base64File);
		} else if (type == "video") {
			let $video = $(`<video class="sg-avatar__image" src="${base64File}"></video>`);
			$video.insertAfter($img);

			$img.remove();
		}
	}
	RemoveListItem($evidence) {
		let evidenceId = $evidence.data("evidenceid");

		$evidence.remove();
		delete this.evidencePool[evidenceId];
	}
	ShowPreview($evidence) {
		$evidence.addClass("previewing");
		$("video", $evidence).attr("controls", "true");
		$("button svg", $evidence).html(this.svgPath.close);
	}
	ClosePreview($evidence) {
		$evidence.removeClass("previewing");
		$("video", $evidence).removeAttr("controls").trigger("pause");
		$("button svg", $evidence).html(this.svgPath.delete);
	}
	async PrepareForm_SendItToExtensionServer() {
		let form = new FormData();
		let comment = this.$comment.val();
		let evidenceIds = Object.keys(this.evidencePool);
		let isEmpty = (
			comment == "" &&
			evidenceIds.length == 0
		);

		if (
			!isEmpty ||
			isEmpty &&
			confirm("You didn't add any evidence or comment.\nDo you still want to delete?")) {

			form.append("comment", comment);
			form.append("id", profileData.id);
			form.append("nick", profileData.nick);
			form.append("url", System.createProfileLink(profileData.nick, profileData.id));

			if (evidenceIds.length == 1) {
				let file = this.evidencePool[evidenceIds[0]].file;

				form.append("file", file, file.name);
			} else if (evidenceIds.length > 1) {
				let zipFile = await this.CompressStoredFiles();

				form.append("file", zipFile, `${profileData.nick}-${profileData.id}.zip`);
			}

			let xhrPromise = AccountDeleteReport(form);

			xhrPromise.progress(event => {
				var percent = 0;
				var position = event.loaded || event.position;
				var total = event.total;

				if (event.lengthComputable) {
					percent = position / total * 100;
				}

				this.progress.update(percent);
				this.progress.updateLabel(System.data.locale.userProfile.accountDelete.uploading.replace("%{percentage_value}", Math.ceil(percent)));
			});

			return xhrPromise;
		} else {
			return new Promise((_, reject) => reject("Canceled by user"));
		}

	}
	CompressStoredFiles() {
		return new Promise((resolve, reject) => {
			try {
				let evidenceIds = Object.keys(this.evidencePool);
				let zip = new JSZip();

				evidenceIds.forEach(evidenceId => {
					let evidence = this.evidencePool[evidenceId];

					zip.file(evidence.file.name, evidence.file, { binary: true });
				});

				this.progress.updateLabel(System.data.locale.userProfile.accountDelete.compressingTheFiles);

				zip.generateAsync({
					type: "blob",
					compression: "DEFLATE",
					compressionOptions: {
						level: 9
					},
					streamFiles: true
				}, metadata => {
					this.progress.update(metadata.percent);

					if (metadata.currentFile) {
						this.progress.updateLabel(System.data.locale.userProfile.accountDelete.compressingTheFile.replace("%{file_name}", metadata.currentFile));
					}
				}).then(function(content) {
					resolve(content);
				});
			} catch (error) {
				reject(error)
			}
		});
	}
}

export default AccountDeleteReporter
