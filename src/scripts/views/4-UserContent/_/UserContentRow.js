import moment from "moment-timezone";
import notification from "../../../components/notification";
import ContentViewer_Content from "./ContentViewer_Content";
import SelectCheckbox from "./SelectCheckbox";
import UserContent from "./UserContent";
import Action from "@BrainlyAction";

export default class UserContentRow {
  /**
   * @param {UserContent} main
   * @param {number} id
   * @param {HTMLTableRowElement} element
   */
  constructor(main, id, element) {
    this.main = main;
    this.id = id;
    this.element = element;
    this.isBusy = false;
    this.deleted = false;
    this.contents = {
      question: null,
      answers: {}
    };
    /**
     * @typedef {import("@BrainlyAction").GQL_ResQuestion} GQL_ResQuestion
     * @type {Promise<GQL_ResQuestion>}
     */
    this.resPromise = undefined;

    $(element).prop("that", this);

    this.AttachID();
    this.FetchContentWithPromise();
    this.RenderAfterResolve();
    this.RenderContentViewer();
    this.BindHandlers();
  }
  AttachID() {
    this.$questionLink = $("a[href]", this.element);
    let URL = this.$questionLink.attr("href");
    this.questionID = System.ExtractId(URL);
    this.element["questionID"] = this.questionID;

    this.$questionLink.attr("target", "_blank");
  }
  async FetchContentWithPromise(refreshContent) {
    console.log(this.main.caller, this.main.caller !== "Comments");
    if (refreshContent || !this.resPromise) {
      /* this.content = this.main.questions[this.element.questionID] = new Content(this.element.questionID);
      this.content.resPromise = this.content.Fetch(); */
      if (!this.main.questions[this.questionID] || !this.main
        .questions[this.questionID].resPromise) {
        if (!this.main.questions[this.questionID])
          this.main.questions[this.questionID] = {};

        this.resPromise = new Action().GetQuestion2(this
          .questionID, { excludeComment: (this.main.caller !== "Comments") }
        );
        this.main.questions[this.questionID].resPromise = this
          .resPromise;
      } else {
        this.resPromise = this.main.questions[this.questionID]
          .resPromise;
      }

      //return this.CheckContentPromise();
    }
  }
  async RenderAfterResolve() {
    this.res = await this.resPromise;
    console.log(this.res.data.question);

    if (this.res && this.res.data) {
      this.RenderQuestionContent();
      this.RenderAnswers();

      /* if (this.res.data.task.settings.is_deleted)
        this.Deleted(true); */
    }

    if (this.main.caller == "Questions" || this.main.caller == "Answers") {
      this.isBusy = false;
      this.checkbox && this.checkbox.HideSpinner();
    }
  }
  RenderContentViewer() {
    this.$viewer = $(`
		<div class="sg-content-box sg-content-box--spaced-top sg-content-box--spaced-bottom-large">
      <div class="sg-box sg-box--no-border sg-box--small-padding" style="width: 52em">
        <div class="sg-box__hole sg-box--full">
      </div>
		</div>`);
    this.$contentContainer = $(".sg-box__hole", this.$viewer);
  }
  RenderQuestionContent() {
    if (this.res && this.res.data && this.res.data.question) {
      let content = new ContentViewer_Content(this.res.data.question);
      this.contents.question = content;

      this.$contentContainer.append(content.container);

      this.RenderAttachmentsIcon(content.data);
    }

    /* let question = this.content.res.data.task;
    let user = this.content.res.users_data.find(user => user.id == question.user_id);
    let contentData = {
    	content: question.content,
    	user,
    	userProfileLink: System.createProfileLink(user.nick, user.id),
    	avatar: System.prepareAvatar(user.avatars, { returnIcon: true })
    }

    this.contentViewer_Contents.question = new ContentViewer_Content(contentData, question);

    this.contentViewer_Contents.question.$.appendTo(this.$contentContainer);

    this.RenderAttachmentsIcon(question); */
  }
  RenderAnswers() {
    if (
      this.res &&
      this.res.data &&
      this.res.data.question &&
      this.res.data.question.answers &&
      this.res.data.question.answers.nodes &&
      this.res.data.question.answers.nodes.length > 0
    ) {
      this.res.data.question.answers.nodes.forEach(this.RenderAnswer.bind(
        this));
    }
  }
  /**
   * @param {import("@BrainlyAction").GQL_Answer} answer
   */
  RenderAnswer(answer) {
    let content = new ContentViewer_Content(answer);
    this.contents.answers[answer.id] = content;

    this.RenderAnswerSeparator();
    this.$contentContainer.append(content.container);

    if (System.DecryptId(answer.author.id) == window.sitePassedParams[0] &&
      this.main.caller ==
      "Answers") {
      this.AttachAnswerID(answer);
      this.RenderBestIcon(answer);
      this.RenderApproveIcon(answer);
      this.RenderAttachmentsIcon(answer);
    }

    /* let user = this.content.res.users_data.find(user => user.id == answer.user_id);
    let contentData = {
    	content: answer.content,
    	user,
    	userProfileLink: System.createProfileLink(user.nick, user.id),
    	avatar: System.prepareAvatar(user.avatars, { returnIcon: true })
    }
    let content = new ContentViewer_Content(contentData, answer);

    this.RenderAnswerSeparator();
    content.$.appendTo(this.$contentContainer);
    this.contentViewer_Contents.answers[answer.id] = content;

    if (answer.user_id == window.sitePassedParams[0] && this.main.caller == "Answers") {
    	this.AttachAnswer(answer);
    	console.log(this);

    	this.RenderBestIcon(answer);
    	this.RenderApproveIcon(answer);
    } */
  }
  RenderAnswerSeparator() {
    let $separator = $(
      `<div class="sg-horizontal-separator sg-horizontal-separator--spaced"></div>`
    );

    $separator.appendTo(this.$contentContainer);
  }
  /**
   * @param {import("@BrainlyAction").GQL_Answer} answer
   */
  AttachAnswerID(answer) {
    let $dateCell = $("td:last", this.element);
    let date = $dateCell.text().trim();

    if (date) {
      let date2 = moment(answer.created);
      date2 = date2.tz(System.data.Brainly.defaultConfig.locale.TIMEZONE);

      if (date == date2.format("YYYY-MM-DD HH:mm:ss")) {
        this.answerID = answer.id;
      }
    }
  }
  /**
   * @param {import("@BrainlyAction").GQL_Answer} answer
   */
  RenderBestIcon(answer) {
    if (answer.isBest) {
      let $icon = this.RenderIcon("mustard", "excellent");

      $icon.attr("title", System.data.locale.userContent.bestAnswer);
    }
  }
  /**
   * @param {import("@BrainlyAction").GQL_Answer} answer
   */
  RenderApproveIcon(answer) {
    if (
      !this.$approveIcon &&
      (
        this.approved || (
          "verification" in answer &&
          answer.verification &&
          answer.verification.approval &&
          answer.verification.approval.approvedTime
        )
      )
    ) {
      this.$approveIcon = this.RenderIcon("mint", "check");

      this.$approveIcon.attr("title", System.data.locale.userContent
        .approvedAnswer);
    }
  }
  HideApproveIcon() {
    if (this.$approveIcon) {
      this.$approveIcon.appendTo("<div />");
    }
  }
  /**
   * @param {import("@BrainlyAction").GQL_Question | import("@BrainlyAction").GQL_Answer} content
   */
  RenderAttachmentsIcon(content) {
    if (content.attachments && content.attachments.length > 0) {
      let iconColor = "dark";

      if ("thanksCount" in content) {
        iconColor = "alt";
      }

      let $icon = this.RenderIcon(iconColor, "attachment");

      $icon.attr("title", System.data.locale.userContent
        .questionHasAttachment);

      if (this.main.caller == "Answers") {
        if ("thanksCount" in content) {
          $icon.attr("title", System.data.locale.userContent
            .answerHasAttachment);
        } else {
          $icon.addClass("separator");
        }
      }
    }
  }
  RenderIcon(color, name) {
    let $icon = $(`
		<button role="button" class="sg-icon-as-button sg-icon-as-button--${color} sg-icon-as-button--xxsmall sg-icon-as-button--action sg-icon-as-button--action-active sg-text--link-disabled sg-list__icon--spacing-right-small">
			<div class="sg-icon-as-button__hole">
				<div class="sg-icon sg-icon--adaptive sg-icon--x10">
					<svg class="sg-icon__svg">
						<use xlink:href="#icon-${name}"></use>
					</svg>
				</div>
			</div>
		</button>`);

    $icon.insertBefore(this.$questionLink);

    return $icon;
  }
  RenderCheckbox() {
    this.checkbox = new SelectCheckbox(this.element, this.id);

    this.isBusy = true;
    this.checkbox.ShowSpinner();
    //this.main.checkboxes.elements.push(checkbox);
    this.checkbox.onchange = this.main.HideSelectContentWarning.bind(this
      .main);
  }
  BindHandlers() {
    this.$questionLink.click(this.ToggleContentViewer.bind(this));
  }
  /**
   * @param {Event} event
   */
  async ToggleContentViewer(event) {
    if (this.res && this.res.data && this.res.data.question) {
      event && event.preventDefault();

      if (this.$contentContainer.children().length == 0) {
        this.RenderQuestionContent();
        this.RenderAnswers();
      }

      if (this.$viewer.is(":visible")) {
        this.$viewer.appendTo("<div />");
      } else {
        this.$viewer.insertAfter(this.$questionLink);
      }
    }
  }
  Deleted(already) {
    this.deleted = true;
    this.isBusy = false;

    this.checkbox.Disable();
    this.checkbox.HideSpinner();
    this.element.classList.add("removed");
    this.element.classList.remove("already");

    if (already)
      this.element.classList.add("already");
  }
  UnDelete() {
    this.deleted = false;
    this.isBusy = false;

    this.checkbox.Activate();
    this.element.classList.remove("removed", "already");
  }
  Reported(already) {
    this.reported = true;

    this.element.classList.add("reported");
    this.element.classList.remove("already");

    if (already)
      this.element.classList.add("already");
  }
  IsNotApproved() {
    /* if (this.approved || (this.contents.answers[this.answerID].source.approved && this.contents.answers[this.answerID].source.approved.date)) {
    	this.Approved();
    }

    return !(this.approved || (this.contents.answers[this.answerID].source.approved && this.contents.answers[this.answerID].source.approved.date)) */
  }
  IsApproved() {
    return (
      this.approved ||
      (
        this.contents.answers[this.answerID].source.approved &&
        this.contents.answers[this.answerID].source.approved.date
      )
    );
  }
  Approved(already) {
    this.approved = true;

    this.RenderApproveIcon();
    this.element.classList.add("approved");
    this.element.classList.remove("unapproved", "already");

    if (already)
      this.element.classList.add("already");
  }
  Unapproved(already) {
    this.approved = false;

    this.HideApproveIcon();
    this.element.classList.add("unapproved");
    this.element.classList.remove("approved", "already");

    if (already)
      this.element.classList.add("already");
  }
  RowNumber() {
    return Number(this.element.children && this.element.children.length > 1 ?
      this.element.children[1].innerText : 0);
  }
  CheckDeleteResponse(resRemove) {
    let rowNumber = this.RowNumber();

    this.checkbox.HideSpinner();

    if (!resRemove || (!resRemove.success && !resRemove.message)) {
      notification(
        `#${rowNumber} > ${System.data.locale.common.notificationMessages.somethingWentWrong}`,
        "error");
    } else {
      this.Deleted();

      if (!resRemove.success && resRemove.message) {
        this.element.classList.add("already");
        notification(`#${rowNumber} > ${resRemove.message}`, "error");
      }
    }
  }
  async CheckApproveResponse(resApprove) {
    let rowNumber = this.RowNumber();

    this.checkbox.HideSpinner();

    if (!resApprove) {
      notification(
        `#${rowNumber} > ${System.data.locale.common.notificationMessages.somethingWentWrong}`,
        "error");
    } else if (!resApprove.success && resApprove.message) {
      notification(`#${rowNumber} > ${resApprove.message}`, "error");
    } else {
      this.FetchContentWithPromise(true);
      await this.SetContentAfterResolve();
      this.UpdateAnswerContent();
      this.Approved();
      this.contents.answers[this.answerID].RenderApproveIcon();

      if (!resApprove.success && !resApprove.message) {
        this.element.classList.add("already");
        let message = System.data.locale.userContent.notificationMessages
          .xIsAlreadyApproved.replace("%{row_id}", ` #${rowNumber} `);
        notification(`${message}`, "info");
      }
    }
  }
  UpdateAnswerContent() {
    let answer = this.res.data.responses.find(response => response.id == this
      .answerID);
    this.contents.answers[this.answerID].source = answer;
  }
  async CheckUnapproveResponse(resUnapprove) {
    let rowNumber = this.RowNumber();

    this.checkbox.HideSpinner();

    if (!resUnapprove) {
      notification(
        `#${rowNumber} > ${System.data.locale.common.notificationMessages.somethingWentWrong}`,
        "error");
    } else if (!resUnapprove.success && resUnapprove.message) {
      notification(`#${rowNumber} > ${resUnapprove.message}`, "error");
    } else {
      this.FetchContentWithPromise(true);
      await this.SetContentAfterResolve();
      this.UpdateAnswerContent();
      this.Unapproved();
      this.contents.answers[this.answerID].HideApproveIcon();

      if (!resUnapprove.success && !resUnapprove.message) {
        this.element.classList.add("already");
        let message = System.data.locale.userContent.notificationMessages
          .xIsAlreadyUnapproved.replace("%{row_id}", `#${rowNumber} `);
        notification(`${message}`, "info");
      }
    }
  }
  CorrectReportResponse(resReport) {
    let rowNumber = this.RowNumber();

    this.checkbox.HideSpinner();

    if (!resReport) {
      notification(
        `#${rowNumber} > ${System.data.locale.common.notificationMessages.somethingWentWrong}`,
        "error");
    } else if (!resReport.success && resReport.code == 3) {
      this.Deleted();
      notification(`#${rowNumber} > ${resReport.message}`, "error");
    } else {
      this.Reported();

      if (!resReport.success && resReport.message) {
        this.element.classList.add("already");
        notification(`#${rowNumber} > ${resReport.message}`, "info");
      }
    }
  }
}
