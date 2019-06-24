import Modal from "../../../../components/Modal";
import Action from "../../../../controllers/Req/Brainly/Action";

const spinner = `<div class="sg-spinner-container__overlay"><div class="sg-spinner sg-spinner--xsmall"></div></div>`;

class PointChanger {
  constructor() {
    this.users = [];
    this.usersWithPoints = {};

    this.Init();
  }
  Init() {
    this.RenderLi();
    this.RenderModal();
    this.BindHandler();
  }
  RenderLi() {
    this.$li = $(`
		<li class="sg-menu-list__element" style="display: table; width: 100%;">
			<span class="sg-menu-list__link sg-text--link">${System.data.locale.core.pointChanger.text}</span>
		</li>`);

  }
  RenderModal() {
    let nUsers = System.data.locale.common.nUsers.replace("%{n}", ` <span>0</span> `);
    this.modal = new Modal({
      header: `<div class="sg-actions-list sg-actions-list--space-between">
				<div class="sg-actions-list__hole">
					<div class="sg-label sg-label--small sg-label--secondary">
						<div class="sg-text sg-text--peach">${System.data.locale.core.pointChanger.text}</div>
					</div>
				</div>
			</div>`,
      content: `<div class="sg-content-box">
				<div class="sg-content-box__content sg-content-box__content--spaced-top js-user-list">

					<div class="sg-content-box id">
						<div class="sg-content-box__content sg-content-box__content--with-centered-text sg-content-box__content--spaced-top">
							<div class="sg-actions-list sg-actions-list--no-wrap">
								<div class="sg-actions-list__hole sg-actions-list__hole--grow">
									<textarea class="sg-textarea sg-textarea--full-width sg-textarea--resizable-vertical" placeholder="${System.data.locale.common.profileID}"></textarea>
								</div>
								<div class="sg-actions-list__hole">
									<button class="sg-button-secondary sg-button-secondary--alt">
										<div class="sg-icon sg-icon--adaptive sg-icon--x22">
											<svg class="sg-icon__svg">
												<use xlink:href="#icon-profile_view"></use>
											</svg>
										</div>
									</button>
								</div>
								<div class="sg-actions-list__hole">
									<button class="sg-button-secondary js-hidden">
										<div class="sg-icon sg-icon--adaptive sg-icon--x22">
											<svg class="sg-icon__svg">
												<use xlink:href="#icon-check"></use>
											</svg>
										</div>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="sg-content-box__actions sg-content-box__content--spaced-bottom-large">
					<div class="sg-actions-list sg-actions-list--no-wrap">
						<div class="sg-actions-list__hole">
							<p class="sg-text">${nUsers}</p>
						</div>
					</div>
				</div>
				<div class="sg-content-box__content">
					<blockquote class="sg-text sg-text--small">
						${System.data.locale.core.pointChanger.youNeedToEnterOrPaste}<br>
						${System.data.locale.core.pointChanger.pastingExample}:<br>
						${System.createProfileLink(System.data.Brainly.userData.user)}<br>
						${System.createProfileLink(314651, "Sakura")}<br>
						1234567<br>
						2345678<br><br>
						${System.data.locale.core.pointChanger.pastingExample2}<br>
						${System.createProfileLink(System.data.Brainly.userData.user)} +1000<br>
						${System.createProfileLink(314651, "Sakura")} -200<br>
						1234567 -95<br>
						2345678 +645<br>
					</blockquote>
				</div>
			</div>`,
      size: "medium"
    });
    this.$idInput = $(".id textarea", this.modal.$modal);
    this.$userList = $(".js-user-list", this.modal.$modal);
    this.$idInputContainer = $(".sg-content-box.id", this.modal.$modal);
    this.$addUserButton = $(".id .sg-actions-list__hole:eq(1) button", this.modal.$modal);
    this.$addPointToAllButton = $(".id .sg-actions-list__hole:eq(2) button", this.modal.$modal);
    this.$amountOfUsers = $(".sg-content-box__actions .sg-actions-list > .sg-actions-list__hole > .sg-text > span", this.modal.$modal);
  }
  BindHandler() {
    let that = this;

    this.modal.$close.click(this.modal.Close.bind(this.modal));
    this.$li.on("click", "span", this.modal.Open.bind(this.modal));
    this.$addPointToAllButton.click(this.AddPointToAll.bind(this));
    this.$idInput.on("paste", this.IdInputPasteEvtHandle.bind(this));

    this.$addUserButton.click(() => {
      let idList = this.GetID()

      this.FindIDs(idList);
    });

    this.$userList.on("click", `button.js-add-point`, async function() {
      let $userNode = $(this).parents(".js-node");
      let $pointInput = $(`input[type="number"]`, $userNode);
      let diffPoint = Number($pointInput.val());

      if (diffPoint) {
        let user = $userNode.prop("userData");
        let $spinner = $(spinner).insertAfter(this);
        let $pointsLabel = $(".js-points", $userNode);

        this.classList.add("sg-button-secondary--disabled");
        await new Action().AddPoint(user.id, diffPoint);
        this.classList.remove("sg-button-secondary--disabled");
        that.modal.notification(System.data.locale.core.notificationMessages.pointsAdded, "success");

        user.points += diffPoint;

        $spinner.remove();
        $pointsLabel.text(user.points + " + ");
      }

      $pointInput.val("").trigger("input");
    });

    this.$userList.on("input", `input[type="number"]`, function() {
      let value = this.value;

      this.classList.remove("sg-input--valid", "sg-input--invalid");

      if (value < 0) {
        this.classList.add("sg-input--invalid");
      } else if (value > 0) {
        this.classList.add("sg-input--valid");
      }
    })
  }
  AddPointToAll() {
    let $buttons = $(`button.js-add-point`, this.$userList);

    $buttons.click();
  }
  IdInputPasteEvtHandle(event) {
    event.preventDefault();

    /**
     * @type {string}
     */
    let saltText = (event.originalEvent || event).clipboardData.getData("text/plain");

    if (saltText) {
      let texts = saltText.split(/\r\n|\n/);
      let idList = [];

      if (texts && texts.length > 0) {
        texts.forEach(text => {
          let splittedText = text.trim().split(" ");

          if (splittedText.length == 0 || !splittedText[0]) {
            if (text)
              this.Paste(`${text}\n`);
          } else {
            let id = System.ExtractId(splittedText[0]);

            if (!id) {
              this.Paste(`${splittedText[0]}\n`);
            } else {
              idList.push(id);

              if (splittedText.length > 1) {
                let points = splittedText[1];

                if (points[0] == "+" || points[0] == "-") {
                  this.usersWithPoints[id] = points.replace("+", "");
                } else {
                  idList = [...idList, ...System.ExtractIds(splittedText)];
                }
              }
            }
          }
        });

        idList = Array.from(new Set(idList));
        idList = this.FilterFetchedUsers(idList);

        if (idList.length == 1) {
          this.FindID(idList[0]);
        } else if (idList.length > 1) {
          this.FindIDs(idList);
        }
      }
    }
  }
  Paste(text = "") {
    document.execCommand("insertText", false, text);
  }
  GetID() {
    let value = this.$idInput.val();

    if (value) {
      let idList = System.ExtractIds(value.split(" "));

      if (idList)
        return idList;
    }
  }
  /**
   * @param {number} id
   */
  IsNotFetched(id) {
    return !this.users.includes(id)
  }
  /**
   * @param {number[]} idList
   */
  FilterFetchedUsers(idList) {
    return idList.filter(this.IsNotFetched.bind(this));
  }
  /**
   * @param {number[]} idList
   */
  async FindIDs(idList) {
    //idList = idList.filter(this.IsNotFetched.bind(this));
    idList = this.FilterFetchedUsers(idList);

    if (idList.length > 0) {
      let res = await new Action().GetUsers(idList);

      if (!res || !res.success) {
        this.modal.notification(res.message || System.data.locale.common.notificationMessages.somethingWentWrong, "error");
      } else {
        this.ClearIdInput();
        res.data.forEach(this.AddUser.bind(this));
      }
    }
  }
  async FindID(id) {
    let res = await new Action().GetUserProfile(id);

    if (!res || !res.success) {
      this.modal.notification(res.message || System.data.locale.common.notificationMessages.somethingWentWrong, "error");
    } else {
      this.AddUser(res.data);
      this.ClearIdInput();
    }
  }
  ClearIdInput() {
    this.$idInput.val("");
  }
  AddUser(user) {
    let avatar = System.prepareAvatar(user);
    let profileLink = System.createProfileLink(user);
    let $lastAddedUser = $(".js-node:last", this.$userList);
    let preDefinedPoints = this.usersWithPoints[user.id];
    let $node = $(`
		<div class="sg-content-box sg-content-box--full js-node">
			<div class="sg-content-box__content sg-content-box__content--spaced-top-small">
				<div class="sg-actions-list">
					<div class="sg-actions-list__hole">
						<div data-test="ranking-item-avatar" class="sg-avatar sg-avatar--normal sg-avatar--spaced">
							<a href="${profileLink}">
								<img class="sg-avatar__image" src="${avatar}">
							</a>
						</div>
					</div>
					<div class="sg-actions-list__hole sg-actions-list__hole--grow">
						<a href="${profileLink}" class="sg-text sg-text--link-unstyled sg-text--bold">
							<span class="sg-text sg-text--small sg-text--gray sg-text--bold">${user.nick}</span>
							<div class="sg-text sg-text--xsmall sg-text--gray">${user.id}</div>
						</a>
					</div>
					<div class="sg-actions-list__hole">
						<span class="sg-text sg-text--small sg-text--gray sg-text--bold js-points">${user.points} + </span>
						<input type="number" class="sg-input sg-input--small" placeholder="${System.data.locale.common.shortPoints}.." tabindex="${$lastAddedUser.index() + 2}">
						<div class="sg-spinner-container">
							<button class="sg-button-secondary sg-button-secondary--small js-add-point" title="${System.data.locale.core.pointChanger.addPoint}">
								<div class="sg-icon sg-icon--adaptive sg-icon--x14">
									<svg class="sg-icon__svg">
										<use xlink:href="#icon-check"></use>
									</svg></div>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>`);

    let $ptsInput = $(`input[type="number"]`, $node);

    this.users.push(user.id);
    this.ChangeAmountOfUser(1);
    $node.prop("userData", user);
    $node.insertBefore(this.$idInputContainer);
    this.$addPointToAllButton.removeClass("js-hidden");

    if (preDefinedPoints)
      $ptsInput
      .val(preDefinedPoints)
      .trigger("input");
  }
  ChangeAmountOfUser(amount) {
    let currentAmount = this.$amountOfUsers.text();

    this.$amountOfUsers.text(Number(currentAmount) + amount);
  }
}

export default PointChanger
