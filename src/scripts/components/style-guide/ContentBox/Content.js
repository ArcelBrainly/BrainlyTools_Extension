import classnames from 'classnames';
import AddChildren from '../helpers/AddChildren';

/**
 * @typedef {boolean
 * | "xxsmall"
 * | "xsmall"
 * | "small"
 * | "normal"
 * | "large"
 * | "xlarge"
 * | "xxlarge"
 * } Size
 * @typedef {"left" | "center" | "right"} Alignment
 * @typedef {{
 *  children?: import("@style-guide/helpers/AddChildren").ChildrenParamType,
 *  full?: boolean,
 *  spacedTop?: Size,
 *  spacedBottom?: Size,
 *  align?: Alignment,
 *  className?: string,
 * }} Properties
 *
 * @typedef {HTMLDivElement} Element
 */
const SG = "sg-content-box__content";
const SGD = `${SG}--`

/**
 * @param {Properties} param0
 * @returns {Element}
 */
export default function({
  children,
  full,
  spacedTop,
  spacedBottom,
  className,
  align = "left",
  ...props
} = {}) {
  const contentBoxClass = classnames(SG, {
    [`${SGD}full`]: full,
    [`${SGD}with-centered-text`]: align === "center",
    [`${SGD}spaced-top`]: spacedTop === "normal" || spacedTop === true,
    [`${SGD}spaced-top-${spacedTop || ''}`]: spacedTop &&
      !(spacedTop === "normal" || spacedTop === true),
    [`${SGD}spaced-bottom`]: spacedBottom === "normal" ||
      spacedBottom === true,
    [`${SGD}spaced-bottom-${spacedBottom || ''}`]: spacedBottom &&
      !(spacedBottom === "normal" || spacedBottom === true)
  }, className);

  let div = document.createElement("div");
  div.className = contentBoxClass;

  AddChildren(div, children);

  if (props)
    for (let [propName, propVal] of Object.entries(props))
      div[propName] = propVal;

  return div;
}
