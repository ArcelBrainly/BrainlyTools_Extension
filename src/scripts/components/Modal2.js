import { Overlay, TopLayer, ContentBox, ContentBoxContent, ContentBoxTitle, ContentBoxActions, Text } from "./style-guide";
import IsVisible from "../helpers/IsVisible";
import notification from "./notification2";

/**
 * @typedef {import("./style-guide/ContentBox/Title").Properties} TitleProperties
 * @typedef {import("./style-guide/ContentBox/Content").Properties} ContentProperties
 * @typedef {import("./style-guide/ContentBox/Actions").Properties} ActionsProperties
 *
 * @typedef {{overlay?: boolean, title?: TitleProperties, content?: ContentProperties, actions?: ActionsProperties}} ModalProperties
 * @typedef {import("./style-guide/TopLayer").Properties & ModalProperties} Properties
 */

export default class Modal {
  /**
   * @param {Properties} properties
   */
  constructor({ overlay, title, content, actions, ...properties } = {}) {
    this.hasOverlay = overlay;
    this.properties = properties;
    this.sections = {
      title,
      content,
      actions
    };

    /**
     * @type {import("./style-guide/ContentBox/Title").Element}
     */
    this._title;
    /**
     * @type {import("./style-guide/ContentBox/Content").Element}
     */
    this._content;
    /**
     * @type {import("./style-guide/ContentBox/Actions").Element}
     */
    this._actions;

    this.Render();

    if (overlay)
      this.RenderInOverlay();
  }
  Render() {
    if (this.sections.title || this.sections.content || this.sections.actions) {
      this.contentBox = ContentBox();

      if (this.sections.title)
        this.RenderTitle(this.sections.title);

      if (this.sections.content)
        this.RenderContent(this.sections.content);

      if (this.sections.actions)
        this.RenderActions(this.sections.actions);
    }

    this.toplayer = TopLayer({
      modal: true,
      size: "medium",
      children: this.contentBox,
      onClose: this.Close.bind(this),
      ...this.properties
    });

    this.modalContainer.appendChild(this.toplayer);
  }
  /**
   * @param {TitleProperties} [props]
   */
  RenderTitle(props = {}) {
    this._title = ContentBoxTitle({
      spacedTop: "normal",
      spacedBottom: "large",
      ...props
    });

    if (props.children)
      this.contentBox.appendChild(this._title);

    this.ObserveSection(this._title);
  }
  /**
   * @param {ContentProperties} [props]
   */
  RenderContent(props = {}) {
    this._content = ContentBoxContent(props);

    if (props.children)
      this.contentBox.appendChild(this._content);

    this.ObserveSection(this._content);
  }
  /**
   * @param {ActionsProperties} [props]
   */
  RenderActions(props = {}) {
    this._actions = ContentBoxActions(props);

    if (props.children)
      this.contentBox.appendChild(this._actions);

    this.ObserveSection(this._actions);
  }
  /**
   * @param {HTMLDivElement} section
   */
  ObserveSection(section) {
    let observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.target) {
          /**
           * @type {HTMLDivElement}
           */
          // @ts-ignore
          let target = mutation.target;

          if (target.children.length)
            this.contentBox.appendChild(target);
          else
            this.HideElement(target);
        }
      })
    });

    observer.observe(section, { childList: true });
  }
  /**
   * @param {HTMLElement} element
   */
  HideElement(element) {
    if (element && element.parentNode)
      element.parentNode.removeChild(element);
  }
  set title(container) {
    this._title = container;
  }
  get title() {
    if (!this._title)
      this.RenderTitle();

    return this._title;
  }
  set content(container) {
    this._content = container;
  }
  get content() {
    if (!this._content)
      this.RenderContent();

    return this._content;
  }
  set actions(container) {
    this._actions = container;
  }
  get actions() {
    if (!this._actions)
      this.RenderActions();

    return this._actions;
  }
  /**
   * param {import("./style-guide/ContentBox/Actions").Element} element
   */
  /* set actions(element) {
    this._actions = element;

    if (!this.actionsContainer)
      this.RenderActions();

    if (element instanceof HTMLElement)
      this.actionsContainer.appendChild(element);
    else
      this.HideElement(this.actionsContainer);

    if (this.actionsContainer.children.length)
      this.contentBox.appendChild(this.actionsContainer);
  }
  get actions() {
    if (!this._actions)
      this.RenderActions();

    return this._actions;
  } */
  RenderInOverlay() {
    this.container = document.createElement("div");
    this.container.className = "js-modal";

    this.modalContainer.appendChild(this.container);

    this.flashContainer = document.createElement("div");
    this.flashContainer.className = "js-flash-container";
    this.flashContainer.style.top = "0";
    this.flashContainer.style.width = "100%";
    this.flashContainer.style.zIndex = "99999";
    this.flashContainer.style.position = "fixed";

    this.container.appendChild(this.flashContainer);

    this.overlay = Overlay();

    this.overlay.appendChild(this.toplayer);
    this.container.appendChild(this.overlay);
  }
  get IsOpen() {
    return IsVisible(this.container);
  }
  get modalContainer() {
    let modalContainer = document.querySelector(".js-modal-container");

    if (!modalContainer) {
      modalContainer = document.createElement("div");
      modalContainer.className = "js-modal-container";

      document.body.appendChild(modalContainer);
    }

    return modalContainer;
  }
  Open() {
    this.modalContainer.appendChild(this.container);
  }
  Close() {
    this.HideElement(this.container);
  }
  /**
   * @param {import("./notification2").Properties} options
   */
  Notification(options) {
    let notificationElement = notification(options);

    if (notificationElement)
      this.flashContainer.appendChild(notificationElement);
  }
}
