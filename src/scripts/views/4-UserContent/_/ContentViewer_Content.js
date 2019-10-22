import mime from "mime-types";
import Build from "@/scripts/helpers/Build";
import {
  ContentBox,
  ContentBoxContent,
  ActionList,
  ActionListHole,
  ContentBoxTitle,
  Avatar,
  Text,
  Box
} from "@style-guide";

export default class ContentViewer_Content {
  /**
   * @param {import("@BrainlyAction").GQL_Question | import("@BrainlyAction").GQL_Answer} data
   */
  constructor(data) {
    this.data = data;
    /* this.contentData = {
      content: source.content,
      user,
      userProfileLink: System.createProfileLink(user),
      avatar: System.prepareAvatar(user.avatars, { returnIcon: true })
    } */

    this.CheckLatex();
    this.RenderContent();
  }
  CheckLatex() {
    if (this.data.content) {
      this.data.content = this.data.content.replace(/(?:\r\n|\n)/g, "")
        .replace(/\[tex\](.*?)\[\/tex\]/gi, (_, latex) => {
          let latexURI = window.encodeURIComponent(latex);

          if (!latex.startsWith("\\")) {
            latexURI = `%5C${latexURI}`;
          }

          return `<img src="${System.data.Brainly.defaultConfig.config.data.config.serviceLatexUrlHttps}${latexURI}" title="${latex}" align="absmiddle" class="latex-formula sg-box__image">`
        });
    }
  }
  RenderContent() {
    let avatar = System.ExtractAvatarURL(this.data.author);
    let profileLink = System.createProfileLink(this.data.author);
    this.container = Box({
      full: true,
      border: false,
      padding: "small",
      noBorderRadius: true,
      children: Build(
        ActionList({ toTop: true, noWrap: true }),
        [
          [
            ActionListHole(),
            [
              [
                ContentBox(),
                [
                  [
                    ContentBoxTitle({ spacedBottom: true }),
                    Avatar({
                      spaced: true,
                      imgSrc: avatar,
                      link: profileLink,
                    })
                  ],
                  this.attachmentsIconContainer =
                  ContentBoxContent(),
                ]
              ]
            ]
          ],
          [
            ActionListHole({ grow: true }),
            [
              [
                this.iconsContainer = ContentBox(),
                [
                  [
                    ContentBoxTitle({ spacedBottom: true }),
                    [
                      [
                        ActionList({ noWrap: true }),
                        [
                          [
                            ActionListHole(),
                            [
                              [
                                ContentBox(),
                                [
                                  [
                                    ContentBoxContent(),
                                    Text({
                                      size: "small",
                                      weight: "bold",
                                      color: "gray",
                                      href: profileLink,
                                      html: this.data.author
                                        .nick,
                                    })
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  ],
                  [
                    ContentBoxContent({ full: true }),
                    [
                      [
                        ActionList({
                          toTop: true,
                          noWrap: true
                        }),
                        [
                          [
                            ActionListHole({ hideOverflow: true }),
                            Text({
                              size: "small",
                              breakWords: true,
                              html: this.data.content,
                            }),
                          ]
                        ]
                      ]
                    ]
                  ]
                ]
              ]
            ]
          ],
        ])
    });

    this.RenderBestIcon();
    this.RenderApprovedIcon();
    //this.RenderQuestionPoints();

    if (System.DecryptId(this.data.author.id) == window.sitePassedParams[0]) {
      this.container.classList.add("sg-box--gray-secondary-lightest");
    }

    if (this.data.attachments && this.data.attachments.length > 0) {
      this.RenderAttachmentsIcon();
      this.RenderAttachments();
    }
  }
  RenderBestIcon() {
    if ("isBest" in this.data && this.data.isBest) {
      this.RenderIcon("mustard", "excellent");
    }
  }
  RenderApprovedIcon() {
    if (
      "verification" in this.data &&
      this.data.verification &&
      this.data.verification.approval &&
      this.data.verification.approval.approvedTime
    ) {
      this.$approveIcon = this.RenderIcon("mint", "verified");
    }
  }
  HideApproveIcon() {
    if (this.$approveIcon) {
      this.$approveIcon.appendTo("<div />");
    }
  }
  RenderIcon(color, name) {
    let $icon = $(`
		<div class="sg-content-box__content sg-content-box__content--spaced-bottom sg-content-box__content--with-centered-text">
			<svg class="sg-icon sg-icon--x32 sg-icon--${color}">
				<use xlink:href="#icon-${name}"></use>
			</svg>
		</div>`);

    $icon.insertBefore(this.attachmentsIconContainer);

    return $icon;
  }
  RenderQuestionPoints() {
    if ("pointsForAnswer" in this.data) {
      let $breadcrumb = $(".sg-breadcrumb-list", this.$);

      let $element = $(`
			<li class="sg-breadcrumb-list__element">
				<span class="sg-text sg-text--bold sg-text--small sg-text--gray">${this.data.pointsForAnswer}+${this.data.pointsForBestAnswer} ${System.data.locale.common.shortPoints.toLowerCase()}</span>
			</li>`);

      $element.appendTo($breadcrumb);
    }
  }
  RenderAttachmentsIcon() {
    this.$attachmentIcon = $(`
		<span class="sg-text sg-text--link-unstyled sg-text--bold">
			<div class="sg-box sg-box--dark sg-box--no-border sg-box--xxsmall-padding sg-box--no-min-height">
				<div class="sg-box__hole">
					<div class="sg-label sg-label--small sg-label--secondary">
						<div class="sg-label__icon">
							<div class="sg-icon sg-icon--dark sg-icon--x14">
								<svg class="sg-icon__svg">
									<use xlink:href="#icon-attachment"></use>
								</svg>
							</div>
						</div>
						<div class="sg-label__number">${this.data.attachments.length}</div>
					</div>
				</div>
			</div>
		</span>`);

    this.$attachmentIcon.appendTo(this.attachmentsIconContainer);
    this.$attachmentIcon.click(this.ToggleAttachments.bind(this));
  }
  RenderAttachments() {
    this.$attachmentsContainer = $(`
    <div class="sg-content-box__actions sg-content-box__actions--spaced-top-xxlarge">
      <div class="sg-actions-list"></div>
    </div>`);

    this.$attachments = $("> div", this.$attachmentsContainer);

    this.data.attachments.forEach(this.RenderAttachment.bind(this));
  }
  /**
   * @param {import("@BrainlyAction").GQL_Attachment} attachment
   */
  RenderAttachment(attachment) {
    let $hole = $(`
    <div class="sg-actions-list__hole sg-actions-list__hole--space-bellow">
      <a href="${attachment.url}" target="_blank">
        <div class="sg-box sg-box--dark sg-box--image-wrapper"></div>
      </a>
    </div>`);
    let $box = $(".sg-box", $hole);
    let fileName = (
      mime.extension(attachment.url) ||
      mime.lookup(attachment.url)
    ).toLocaleUpperCase();

    if (attachment.thumbnailUrl) {
      $(`<img class="sg-box__image" src="${attachment.thumbnailUrl}">`)
        .appendTo($box);
    } else {
      $(`
      <div class="sg-box__hole">
        <span class="sg-text sg-text--small sg-text--link sg-text--bold sg-text--gray">${fileName}</span>
      </div>`).appendTo($box);
    }

    $hole.appendTo(this.$attachments)
  }
  ToggleAttachments() {
    if (this.$attachmentsContainer.is(":visible")) {
      return this.$attachmentsContainer.detach();
    }

    this.$attachmentsContainer.appendTo(this.iconsContainer);
  }
}
