class RadioSection {
  /**
   * @typedef {{id:string, label:string}} Item
   * @typedef {[Item]} Items
   * @param {{ name?:string, text?: string, warning?: string, items?: Items, changeHandler?: function, noHorizontalSeparator?: boolean }} param0
   */
  constructor({ name, text, warning, items, changeHandler, noHorizontalSeparator = false }) {
    this.name = name;
    this.text = text;
    this.warning = warning;
    this.items = items;
    this.changeHandler = changeHandler;
    this.noHorizontalSeparator = noHorizontalSeparator;

    this.Render();
    this.RenderHorizontalSeparator();
    this.RenderWarning();

    if (items.length > 0)
      this.RenderItems();

    this.BindHandler();
  }
  Render() {
    this.$ = $(`
    <div class="sg-content-box__actions">
      <div class="sg-actions-list sg-content-box__actions--spaced-top sg-content-box__actions--spaced-bottom sg-actions-list--no-wrap sg-actions-list--to-top">
        <div class="sg-actions-list__hole sg-actions-list__hole--no-shrink">
          <span class="sg-text sg-text--small">${this.text}:</span>
        </div>
        <div class="sg-actions-list__hole sg-actions-list__hole--no-spacing">
          <div class="sg-actions-list"></div>
        </div>
      </div>
    </div>`);

    this.$list = $("> .sg-actions-list > .sg-actions-list__hole:eq(1) > .sg-actions-list", this.$);
  }
  RenderHorizontalSeparator() {
    this.$separator = $(`<div class="sg-horizontal-separator"></div>`);

    if (!this.noHorizontalSeparator)
      this.$separator.prependTo(this.$);
  }
  RenderWarning() {
    this.$warning = $(`<div class="sg-bubble sg-bubble--top sg-bubble--row-start sg-bubble--peach sg-text--white" style="z-index: 1;">${this.warning}</div>`);
  }
  RenderItems() {
    this.items.forEach((item, i) => {
      this.RenderItem(item);

      if (i + 1 < this.items.length)
        this.RenderSeparator();
    });
  }
  /**
   * @param {Item} item
   */
  RenderItem(item) {
    let $item = $(`
    <div class="sg-actions-list__hole sg-actions-list__hole--no-spacing">
      <div class="sg-label sg-label--secondary">
        <label class="sg-actions-list">
          <div class="sg-label__icon sg-actions-list__hole">
            <div class="sg-radio">
              <input type="radio" class="sg-radio__element" name="${this.name}" id="${item.id}">
              <label class="sg-radio__ghost"></label>
            </div>
          </div>
          <span class="sg-label__text sg-actions-list__hole">${item.label}</span>
        </label>
      </div>
    </div>`);

    $item.appendTo(this.$list);
  }
  RenderSeparator() {
    let $separator = $(`<div class="sg-vertical-separator sg-vertical-separator--small"></div>`);

    $separator.appendTo(this.$list)
  }
  BindHandler() {
    $("input", this.$list).change(this.InputChanged.bind(this));
  }
  InputChanged(event) {
    this.HideWarning();

    if (this.changeHandler)
      this.changeHandler(event);
  }
  Hide() {
    this.$.appendTo("<div />");
  }
  ShowWarning() {
    if (!this.$warning.is(":visible")) {
      this.$warning.appendTo(this.$);
    } else {
      this.$warning
        .fadeTo('fast', 0.5)
        .fadeTo('fast', 1)
        .fadeTo('fast', 0.5)
        .fadeTo('fast', 1);
    }

    this.$warning.focus();
  }
  async HideWarning() {
    await this.$warning.slideUp('fast').promise();
    this.$warning.appendTo("<div />").show();
  }
}

export default RadioSection
