import classnames from 'classnames';
import Text from '../Text';

/**
 * @typedef {"xxsmall" | "xsmall" | "small" | "normal" | "large" | "xlarge" | "xxlarge"} Size
 *
 * @typedef {"left" | "center" | "right"} Alignment
 *
 * @typedef {{children?: string | HTMLElement, spaced?: boolean, spacedSmall?: boolean, spacedTop?: Size, spacedBottom?: Size,full?: boolean, className?: string, align?: Alignment}} Properties
 *
 * @typedef {HTMLDivElement} Element
 */
const SG = "sg-content-box__title";
const SGD = `${SG}--`

/**
 * @param {Properties} param0
 * @returns {Element}
 */
export default function({ children, spaced, spacedSmall, spacedTop, spacedBottom, className, align = "left", ...props } = {}) {
  const contentBoxClass = classnames(SG, {
    [`${SGD}with-centered-elements`]: align === "center",
    [`${SGD}spaced`]: spaced,
    [`${SGD}spaced-small`]: spacedSmall,
    [`${SGD}spaced-top`]: spacedTop === "normal",
    [`${SGD}spaced-top-${spacedTop || ''}`]: spacedTop && spacedTop !== "normal",
    [`${SGD}spaced-bottom`]: spacedBottom === "normal",
    [`${SGD}spaced-bottom-${spacedBottom || ''}`]: spacedBottom && spacedBottom !== "normal"
  }, className);

  let div = document.createElement("div");
  div.className = contentBoxClass;

  if (children) {
    if (typeof children == "string")
      children = Text({
        html: children,
        color: "gray",
        weight: "bold",
        size: "large"
      });

    div.appendChild(children);
  }

  if (props)
    for (let [propName, propVal] of Object.entries(props))
      div[propName] = propVal;

  return div;
}
