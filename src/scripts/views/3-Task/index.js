"use strict";

import { RemoveQuestion, RemoveAnswer } from "../../controllers/ActionsOfBrainly";
import Buttons from "../../components/Buttons";
import WaitForFn from "../../helpers/WaitForFn";
import WaitForElm from "../../helpers/WaitForElm";
import Notification from "../../components/Notification"

System.pageLoaded("Task inject OK!");

	const selectors = {
		articleQuestion: "article.brn-question",
		taskModerateButtonContainer: "article.brn-question:not(.brn-question--deleted) .question-header > .sg-actions-list > .sg-actions-list__hole:last-child > .sg-actions-list",
		taskModerateButton: ".question-header > .sg-actions-list > .sg-actions-list__hole:last-child > .sg-actions-list > .sg-actions-list__hole:first-child",

		responseParentContainer: ".js-answers-wrapper",
		responseContainer: ".brn-answer",
		responseModerateButtonContainer: "> .sg-content-box > .sg-actions-list > div:not(.js-best-answer-label-container)"
	}
System.checkUserP(2, () => {
	/**
	 * Prepare and add quick delete buttons to question box
	 */
	let taskDeleteButtons = Buttons('RemoveQuestion', [
		{
			text: System.data.Brainly.deleteReasons.__withTitles.task[System.data.config.quickDeleteButtonsReasons.task[0]].title,
			title: System.data.Brainly.deleteReasons.__withTitles.task[System.data.config.quickDeleteButtonsReasons.task[0]].text,
			type: "peach",
			icon: "x"
		},
		{
			text: System.data.Brainly.deleteReasons.__withTitles.task[System.data.config.quickDeleteButtonsReasons.task[1]].title,
			title: System.data.Brainly.deleteReasons.__withTitles.task[System.data.config.quickDeleteButtonsReasons.task[1]].text,
			type: "peach",
			icon: "x"
		}
	], `<li class="sg-list__element  sg-actions-list--to-right">{button}</li>`);

	let $taskModerateButtons = $(`
	<div class="sg-actions-list sg-actions-list--to-right sg-actions-list--no-wrap">
		<div class="sg-content-box" style="height: 0;">
			<ul class="sg-list ext_actions">
				${taskDeleteButtons}
			</ul>
		</div>
	</div>`);

	$taskModerateButtons.insertAfter(selectors.taskModerateButtonContainer);

	let taskModerateButtonsClickHandler = function() {
		let btn_index = $(this).parent().index();
		let parentArticle = $(this).parents(selectors.articleQuestion);
		let question_id = Number(parentArticle.data("question-id"));

		if (question_id > 0) {
			if (confirm(System.data.locale.common.moderating.doYouWantToDelete)) {
				let reason = System.data.Brainly.deleteReasons.__withTitles.task[System.data.config.quickDeleteButtonsReasons.task[btn_index]];
				let taskData = {
					model_id: question_id,
					reason_id: reason.category_id,
					reason: reason.text
				};
				let svg = $("svg", this);
				let spinner = $(`<div class="sg-spinner sg-spinner--xxsmall sg-spinner--light"></div>`).insertBefore(svg);
				svg.hide();
				RemoveQuestion(taskData, res => {
					if (res) {
						if (res.success) {
							parentArticle.addClass("brn-question--deleted");
							$(selectors.taskModerateButton).remove();
							$taskModerateButtons.remove();
						} else if (res.message) {
							Notification(res.message, "error");
						}
					} else {
						Notification(System.data.locale.common.notificationMessages.somethingWentWrong, "error");
					}
					spinner.remove();
					svg.show();
				});
			}
		} else {
			Console.error("Cannot find the question id");
		}
	};
	$("button", $taskModerateButtons).on("click", taskModerateButtonsClickHandler);
});

System.checkUserP(45, () => {
	/**
	 * Prepare and add quick delete buttons to answer boxes
	 */
	let responseDeleteButtons = Buttons('RemoveQuestion', [
		{
			text: System.data.Brainly.deleteReasons.__withTitles.response[System.data.config.quickDeleteButtonsReasons.response[0]].title,
			title: System.data.Brainly.deleteReasons.__withTitles.response[System.data.config.quickDeleteButtonsReasons.response[0]].text,
			type: "peach",
			icon: "x"
		},
		{
			text: System.data.Brainly.deleteReasons.__withTitles.response[System.data.config.quickDeleteButtonsReasons.response[1]].title,
			title: System.data.Brainly.deleteReasons.__withTitles.response[System.data.config.quickDeleteButtonsReasons.response[1]].text,
			type: "peach",
			icon: "x"
		},
		{
			text: System.data.Brainly.deleteReasons.__withTitles.response[System.data.config.quickDeleteButtonsReasons.response[2]].title,
			title: System.data.Brainly.deleteReasons.__withTitles.response[System.data.config.quickDeleteButtonsReasons.response[2]].text,
			type: "peach",
			icon: "x"
		}
	], `<li class="sg-list__element  sg-actions-list--to-right">{button}</li>`);

	let $responseModerateButtons = $(`
	<div class="sg-actions-list sg-actions-list--to-right sg-actions-list--no-wrap">
		<div class="sg-content-box" style="height: 0;">
			<ul class="sg-list ext_actions">
				${responseDeleteButtons}
			</ul>
		</div>
	</div>`);

	let cloneResponseModerateButtons = () => $responseModerateButtons.clone();
	cloneResponseModerateButtons().insertAfter(selectors.responseContainer + selectors.responseModerateButtonContainer);

	let responseParentContainerFound = responseParentContainer => {
		$(responseParentContainer).observe('added', 'div.js-answer-react', e => {
			cloneResponseModerateButtons().insertAfter($(selectors.responseContainer + selectors.responseModerateButtonContainer, e.addedNodes));
		});
	};
	let observeFound = () => WaitForElm(selectors.responseParentContainer, responseParentContainerFound);
	WaitForFn('$().observe', observeFound);

	let responseModerateButtonsClickHandler = function() {
		let btn_index = $(this).parent().index();
		let parentResponseContainer = $(this).parents(selectors.responseContainer);
		let answer_id = Number(parentResponseContainer.data("answer-id"));

		if (answer_id > 0) {
			if (confirm(System.data.locale.common.moderating.doYouWantToDelete)) {
				let reason = System.data.Brainly.deleteReasons.__withTitles.response[System.data.config.quickDeleteButtonsReasons.response[btn_index]];
				let responseData = {
					model_id: answer_id,
					reason_id: reason.category_id,
					reason: reason.text
				};
				let svg = $("svg", this);
				$(`<div class="sg-spinner sg-spinner--xxsmall sg-spinner--light"></div>`).insertBefore(svg);
				svg.remove();
				RemoveAnswer(responseData, res => {
					if (res && res.success) {
						parentResponseContainer.addClass("brn-question--deleted");
						$(selectors.responseModerateButtonContainer, parentResponseContainer).remove();
						$responseModerateButtons.remove();
					}
				});
			}
		} else {
			Console.error("Cannot find the answer id");
		}
	};
	$(selectors.responseParentContainer).on("click", selectors.responseContainer + " " + selectors.responseModerateButtonContainer + ":last-child button", responseModerateButtonsClickHandler);
});
