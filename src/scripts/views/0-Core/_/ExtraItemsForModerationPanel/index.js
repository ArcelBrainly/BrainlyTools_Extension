"use strict";

import renderModerationPanelSeperator from "../../../../components/ModerationPanelSeperator";
import renderUserFinder from "./UserFinder";
import renderTaskDeleter from "./TaskDeleter"
import PointChanger from "./PointChanger"
import ReportedCommentsDeleter from "./ReportedCommentsDeleter";
import ReportedAnswersConfirmer from "./ReportedAnswersConfirmer2";
//import renderMessageSender from "./MessageSender"
import WaitForObject from "../../../../helpers/WaitForObject";

export default async () => {
	let $seperator = renderModerationPanelSeperator();

	if ($seperator && $seperator.length > 0) {
		renderUserFinder($seperator);

		/* if (System.checkUserP(9)) {
			renderMessageSender($seperator);
		} */

		if ($seperator.parents(".brn-moderation-panel__list").length > 0) {
			if (System.checkUserP(7)) {
				renderTaskDeleter($seperator);
			}

			if (System.checkUserP(13)) {
				$seperator.before(new PointChanger());
			}
		}

		if (System.checkUserP(18)) {
			$seperator.before(new ReportedAnswersConfirmer());
		}

		await WaitForObject("window.System.data.Brainly.deleteReasons.__withTitles.comment", { noError: true });
		if (System.checkUserP(17)) {
			$seperator.before(new ReportedCommentsDeleter());
		}
	}
}
