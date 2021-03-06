import classnames from 'classnames';
import Spinner from ".";
import AddChildren from '../helpers/AddChildren';

/**
 * @typedef {"xxsmall" | "xsmall" | "small"} Size
 *
 * @typedef {{
 *  loading?: boolean,
 *  light?: boolean,
 *  fullWidth?: boolean,
 *  size?: import("./index").Size,
 *  children?: import("@style-guide/helpers/AddChildren").ChildrenParamType,
 *  className?: string,
 * }} Properties
 */
const SG = "sg-spinner-container";
const SG_ = `${SG}__`

/**
 * @param {Properties} param0
 */
export default ({
  loading,
  light,
  fullWidth,
  size,
  children,
  className,
  ...props
} = {}) => {

  let spinnerContainerClass = classnames(SG, {
    [`${SG}--full-width`]: fullWidth,
  }, className);

  let container = document.createElement("div");
  container.className = spinnerContainerClass;

  AddChildren(container, children);

  if (props)
    for (let [propName, propVal] of Object.entries(props))
      container[propName] = propVal;

  if (loading) {
    let overlay = document.createElement("div");
    overlay.className = `${SG_}overlay`;

    container.appendChild(overlay);

    let spinner = Spinner({
      light,
      size
    });

    overlay.appendChild(spinner);
  }

  return container;
}
