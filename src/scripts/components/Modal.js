import Toplayer from "./Toplayer";
import notification from "./notification";

class Modal extends Toplayer {
  /**
   * @param {import("./Toplayer").options} options
   */
  constructor(options) {
    super(options);

    this.RenderModal();
  }
  RenderModal() {
    this.$modal = $(`
    <div class="js-modal">
      <div class="js-flash-container" style="z-index: 99999;position: fixed;top: 0px;width: 100%;"></div>
			<div class="sg-overlay"></div>
		</div>`);

    this.$overlay = $(".sg-overlay", this.$modal);
    this.$flashContainer = $(".js-flash-container", this.$modal);

    this.$toplayer.appendTo(this.$overlay);
  }
  Close() {
    this.$modal.appendTo("<div />>");
  }
  Open() {
    this.$modal.appendTo("div.js-toplayers-container");
  }
  notification(message, type = "", makePermanent = false) {
    let $notification = notification(message, type, makePermanent);

    if ($notification)
      $notification.appendTo(this.$flashContainer);
  }
}
export default Modal;
