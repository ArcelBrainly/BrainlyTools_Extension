import moment from "moment-timezone";
import UserContent from "./_/UserContent";
import Action from "../../controllers/Req/Brainly/Action";

class Comments extends UserContent {
  constructor() {
    super("Comments");

  }
  InitComments() {
    if (System.checkUserP(16)) {
      this.RenderCheckboxes();
      this.RenderDeleteSection("comment");
      this.ShowDeleteSection();
      this.GetQuestions();
      this.BindHandlers();
    }
  }
  GetQuestions() {
    $.each(this.questions, this.GetQuestion.bind(this));
    Object.entries(this.questions).forEach(console.log)
  }
  /**
   * @param {number} questionID
   * @param {import("./_/UserContent").questions} question
   */
  async GetQuestion(questionID, question) {
    question.res = await question.resPromise;
    let rows = this.rows.filter(row => row.questionID == questionID);

    if (!question.res || !question.res.data || !question.res.data.question)
      return rows.forEach(row => row.Deleted(true));

    let allComments = this.FindUsersComments(question.res.data
      .question);

    this.AttachCommentsToRows(allComments, rows);
  }
  /**
   *
   * @param {import("@BrainlyAction").GQL_Question} data
   */
  FindUsersComments(data) {
    let questionComments = this.FindCommentsFromContent(data);
    let answersComments = this.FindCommentsFromContents(data.answers.nodes);
    /**
     * @type {import("@BrainlyAction").GQL_Comment[]}
     */
    let usersComments = [
      ...questionComments,
      ...answersComments,
    ];

    return usersComments
  }
  /**
   * @param {import("@BrainlyAction").GQL_Answer[]} contents
   */
  FindCommentsFromContents(contents) {
    let allComments = [];

    if (contents.length > 0)
      contents.forEach(content => {
        let comments = this.FindCommentsFromContent(content);
        allComments = [
          ...allComments,
          ...comments
        ];
      });

    return allComments;
  }
  /**
   * @param {import("@BrainlyAction").GQL_Question | import("@BrainlyAction").GQL_Answer} content
   */
  FindCommentsFromContent(content) {
    return content.comments.edges.filter(this.FindCommentsFromEdge.bind(this))
  }
  /**
   * @param {import("@BrainlyAction").GQL_CommentEdge} edge
   */
  FindCommentsFromEdge(edge) {
    if (
      System
      // @ts-ignore
      .DecryptId(edge.node.author.id) == Number(window.sitePassedParams[0])
    ) {
      edge.node.content = edge.node.content.replace(/(<([^>]+)>)/gmi, "");

      return true;
    };
  }
  /**
   * @param {import("@BrainlyAction").GQL_Comment[]} allComments
   * @param {import("./_/UserContentRow").default[]} rows
   */
  AttachCommentsToRows(allComments, rows) {
    allComments.forEach(comment => this.AttachCommentToRows(comment, rows));
  }
  /**
   * @param {import("@BrainlyAction").GQL_Comment} comment
   * @param {import("./_/UserContentRow").default[]} rows
   */
  AttachCommentToRows(comment, rows) {
    rows.forEach(row => this.AttachCommentToRow(comment, row));
  }
  /**
   * @param {import("@BrainlyAction").GQL_Comment} comment
   * @param {import("./_/UserContentRow").default} row
   */
  AttachCommentToRow(comment, row) {
    let $dateCell = $("td:last", row.element);
    let date = $dateCell.text().trim();
    let $contentCell = $("td:eq(2)", row.element);
    let cellText = $contentCell.text().trim().slice(0, -3);

    if (date) {
      let date2 = moment(comment.created);
      date2 = date2.tz(System.data.Brainly.defaultConfig.locale.TIMEZONE);

      //console.log(date, date2.format("YYYY-MM-DD HH:mm:ss"), comment.created, date == date2.format("YYYY-MM-DD HH:mm:ss"));
      if (date == date2.format("YYYY-MM-DD HH:mm:ss")) {
        /* if (date) {
        	date = moment(date + System.data.Brainly.defaultConfig.locale.OFFSET).tz(System.data.Brainly.defaultConfig.locale.TIMEZONE);

        	if (date.format() == comment.created) { */
        let fetchedText = comment.content.replace(/ {2,}/g, " ");

        if (fetchedText.startsWith(cellText)) {
          row.isBusy = false;
          row.comment = comment;
          row.checkbox.HideSpinner();
          row.UnDelete();
          //row.element.dataset.commentId = comment.id;
        }
      }
    }
  }
  BindHandlers() {
    this.$deleteButton.click(this.DeleteSelectedComments.bind(this));
  }
  async DeleteSelectedComments() {
    let rows = this.DeletableRows();

    if (rows.length == 0) {
      this.ShowSelectContentWarning();
    } else if (this.deleteSection.selectedReason) {
      this.HideSelectContentWarning();
      await System.Delay(50);

      if (confirm(System.data.locale.common.moderating.doYouWantToDelete)) {
        this.postData = {
          reason: this.deleteSection.reasonText,
          reason_id: this.deleteSection.selectedReason.id,
          reason_title: this.deleteSection.selectedReason.title,
          give_warning: this.deleteSection.giveWarning
        };

        rows.forEach(this.Row_DeleteComment.bind(this));
      }
    }
  }
  async Row_DeleteComment(row) {
    if (row.deleted) {
      row.Deleted();
    } else {
      let postData = {
        ...this.postData,
        model_id: row.comment.id
      }

      row.checkbox.ShowSpinner();

      let resRemove = await new Action().RemoveComment(postData);
      /* await System.Delay();
      let resRemove = { success: false, message: "Önceden silinmiş" }; */

      row.CheckDeleteResponse(resRemove);
    }
  }
}

new Comments();
