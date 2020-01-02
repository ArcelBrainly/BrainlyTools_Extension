import classnames from 'classnames';
import AddChildren from '../helpers/AddChildren';

export const ALIGNMENT = {
  BASELINE: 'align-baseline',
  STRETCH: 'stretch'
};
/**
 * @typedef {"to-right" | "centered" | "space-between" | "space-around" |
 * "space-evenly"} Direction
 * @typedef {"BASELINE" | "STRETCH"} ALIGNMENT
 * @typedef {{
 *  children?: import("@style-guide/helpers/AddChildren").ChildrenParamType,
 *  toTop?: boolean,
 *  direction?: Direction,align?: ALIGNMENT,
 *  noWrap?: boolean,
 *  className?: string,
 * }} Properties
 */

const sg = "sg-actions-list";
const SGD = `${sg}--`;

/**
 * @param {Properties} param0
 */
export default function({
  children,
  toTop,
  direction,
  align,
  noWrap,
  className,
  ...props
} = {}) {
  const actionListClass = classnames(sg, {
    [SGD + direction]: direction,
    [SGD + ALIGNMENT[align]]: ALIGNMENT[align],
    [`${SGD}to-top`]: toTop,
    [`${SGD}no-wrap`]: noWrap
  }, className);

  let div = document.createElement("div");
  div.className = actionListClass;

  AddChildren(div, children);

  if (props)
    for (let [propName, propVal] of Object.entries(props))
        div[propName] = propVal;

  return div;
}
