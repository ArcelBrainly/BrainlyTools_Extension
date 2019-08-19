import classnames from 'classnames';
import Icon from "./Icon";

/**
 * @typedef {import("./Icon").Properties} IconProperties
 * @typedef {import("./Icon").IconElement} IconElement
 *
 * @typedef {"primary"|"primary-inverted"|"primary-blue"|"primary-mint"|"secondary"|"link-button"|"link-button-inverted"|"link-button-peach"|"link-button-mustard"|"link-button-mint"|"link-button-blue"|"destructive"|"warning"|"facebook"} Type
 *
 * @typedef {"large"|"medium"|"small"|"xsmall"} Size
 *
 * @typedef {boolean | {small: boolean, xsmall: boolean, xxsmall: boolean, large: boolean, xlarge: boolean, xxlarge: boolean}} sizeList
 * @typedef {boolean | {top: sizeList, left: sizeList, bottom: sizeList, right: sizeList}} cornerSpaces
 *
 * @typedef {function(Type):ButtonElement} ChangeType
 * @typedef {function(Type):ButtonElement} ToggleType
 * @typedef {function(IconElement=):ButtonElement} ChangeIcon
 *
 * @typedef {{_type: Type, mainType:Type, icon: IconElement, Hide: Hide, Show: Show, Enable: Enable, Disable: Disable, Active: Active, Inactive: Inactive, ChangeType: ChangeType, ToggleType: ToggleType, IsDisabled: IsDisabled, ChangeIcon: ChangeIcon}} CustomProperties
 * @typedef {(HTMLAnchorElement|HTMLButtonElement|HTMLLabelElement) & CustomProperties} ButtonElement
 *
 * @typedef {{tag?: "button" | "a" | "label", size?: Size, type?: Type, icon?: IconProperties, href?: string, fullWidth?: boolean, disabled?: boolean, children?: HTMLElement, className?: string, text?: string, html?: string, spaced?: cornerSpaces}} Properties
 */

const sg = "sg-button";
const SGD = `${sg}--`;
const SG_ = `${sg}__`;

/**
 * @param {Properties} param0
 */
export default function({ tag = "button", size, type, icon, href, fullWidth, disabled, children, className, text, html, spaced, ...props } = {}) {
  if (text && html)
    throw "Content should be filled either with text or html";

  const btnClass = classnames(sg, {
      [SGD + size]: size,
      [SGD + type]: type,
      [`${SGD}disabled`]: disabled,
      [`${SGD}full-width`]: fullWidth
    },
    className
  );

  if (href)
    tag = "a";

  /**
   * @type {ButtonElement}
   */
  // @ts-ignore
  let button = document.createElement(tag);
  button.className = btnClass;

  if (spaced) {
    let styles = [];

    if (typeof spaced == "boolean")
      styles.push(`${SGD}spaced`);

    if (typeof spaced == "object")
      for (let [corner, sizeName] of Object.entries(spaced)) {
        if (typeof sizeName == "boolean")
          styles.push(`${SGD}spaced-${corner}`);

        if (typeof sizeName == "object") {
          let sizes = Object.keys(sizeName);

          sizes.forEach(size => {
            styles.push(`${SGD}spaced-${corner}-${size}`);
          });
        }
      }

    button.classList.add(...styles);
  }

  if (disabled && button instanceof HTMLButtonElement)
    button.disabled = true;

  if (href && button instanceof HTMLAnchorElement)
    button.href = href;

  if (props)
    for (let [propName, propVal] of Object.entries(props))
      button.setAttribute(propName, propVal)

  if (text || html || children) {
    let textElement = document.createElement("span");
    textElement.className = `${SG_}text`;

    if (html)
      textElement.innerHTML = html;
    else if (text)
      textElement.innerText = text;

    if (children)
      textElement.appendChild(children);

    button.appendChild(textElement);
  }

  if (icon) {
    let iconElement = Icon({
      size: size == "xsmall" ? 18 : 24,
      color: "adaptive",
      ...icon
    });
    button.icon = iconElement;

    AddIcon.bind(this)(iconElement);
  }

  button._type = type;
  button.mainType = type;
  button.Hide = Hide;
  button.Show = Show;
  // @ts-ignore
  button.Enable = Enable;
  // @ts-ignore
  button.Disable = Disable;
  button.Active = Active;
  button.Inactive = Inactive;
  // @ts-ignore
  button.ChangeType = _ChangeType;
  // @ts-ignore
  button.ToggleType = _ToggleType;
  button.IsDisabled = IsDisabled;
  // @ts-ignore
  button.ChangeIcon = _ChangeIcon;

  return button;
}

/**
 * @typedef {Hide} Hide
 * @this {ButtonElement}
 * @returns {ButtonElement}
 */
function Hide() {
  this.classList.add("js-hidden")

  return this;
}

/**
 * @typedef {Show} Show
 * @this {ButtonElement}
 * @returns {ButtonElement}
 */
function Show() {
  this.classList.remove("js-hidden")

  return this;
}

/**
 * @typedef {Disable} Disable
 * @this {ButtonElement}
 * @returns {ButtonElement}
 */
function Disable() {
  if (this instanceof HTMLButtonElement)
    this.disabled = true;

  this.classList.add(`${SGD}disabled`)

  return this;
}

/**
 * @typedef {Enable} Enable
 * @this {ButtonElement}
 * @returns {ButtonElement}
 */
function Enable() {
  if (this instanceof HTMLButtonElement)
    this.disabled = false;

  this.classList.remove(`${SGD}disabled`);

  return this;
}

/**
 * @typedef {Active} Active
 * @this {ButtonElement}
 * @returns {ButtonElement}
 */
function Active() {
  this.classList.add(`${SGD}active`);

  return this;
}

/**
 * @typedef {Inactive} Inactive
 * @this {ButtonElement}
 * @returns {ButtonElement}
 */
function Inactive() {
  this.classList.remove(`${SGD}active`);

  return this;
}

/**
 * typedef {ChangeType} ChangeType
 * @this {ButtonElement}
 * @param {Type} type
 * returns {ButtonElement}
 */
function _ChangeType(type) {
  this.classList.remove(SGD + this._type);
  this.classList.remove(SGD + this.mainType);
  this.classList.add(SGD + type);

  this._type = type;
  this.mainType = type;

  return this;
}

/**
 * typedef {ToggleType} ToggleType
 * @this {ButtonElement}
 * @param {Type} type
 * @returns {ButtonElement}
 */
function _ToggleType(type) {
  this.classList.toggle(SGD + this.mainType);

  let hasNewClass = this.classList.toggle(SGD + type);
  this._type = hasNewClass ? type : this.mainType;

  return this;
}

/**
 * @typedef {IsDisabled} IsDisabled
 * @this {ButtonElement}
 */
function IsDisabled() {
  return this.classList.contains(`${SGD}disabled`);
}

/**
 * @this {ButtonElement}
 * @param {IconElement} [icon]
 */
function _ChangeIcon(icon) {
  if (!icon)
    return DeleteIcon.bind(this)();

  if (!this.icon)
    return AddIcon.bind(this)(icon);

  let iconContainer = this.querySelector(`.${SG_}icon`);

  this.icon.remove();
  /* iconContainer.childNodes.forEach(node => node.remove()); */
  iconContainer.appendChild(icon);

  this.icon = icon;

  return this;
}

/**
 * @this {ButtonElement}
 * @param {IconElement} icon
 */
function AddIcon(icon) {
  this.icon = icon;
  let iconContainer = document.createElement("span");

  iconContainer.appendChild(icon);
  iconContainer.classList.add(`${SG_}icon`);

  this.insertBefore(iconContainer, this.firstChild);

  return this;
}

/**
 * @this {ButtonElement}
 */
function DeleteIcon() {
  this.icon = undefined;
  let icon = this.querySelector(`.${SG_}icon`);

  if (icon)
    icon.remove();
}
