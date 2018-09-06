const buttons = {
	RemoveQuestion: `
		<button class="sg-button-secondary sg-label--unstyled{type}">
			<label class="sg-label__text">{text}</label>
			<span class="sg-button-primary__icon">
				<svg class="sg-icon sg-icon--adaptive sg-icon--x14">
				<use xlink:href="#icon-{icon}"></use>
				</svg>
			</span>
		</button>`,
	RemoveQuestionMore: `<button class="sg-button-secondary sg-button-secondary--small sg-button-secondary--alt">{text}</button>`
}
/*
Usage example
Buttons('RemoveQuestion', [
	{
		icon: "stream",
		text: "Default",
		type: "peach"
	}
]);
*/
export default (item_name, text) => {
	let button_list = "";
	if (Object.prototype.toString.call(text) === "[object Array]") {
		if (text.length > 0) {
			for (let i = 0, btn; (btn = text[i]); i++) {
				let button = buttons[item_name]
					.replace(/\{icon\}/igm, btn.icon)
					.replace(/\{text\}/igm, btn.text)
					.replace(/\{type\}/igm, btn.type && btn.type != "" ? " sg-button-secondary--" + btn.type : "")

				button_list += button;
			}
		}
	}
	else if (text.constructor.text === "String") {
		buttons[item_name].replace(/\{text\}/igm, text)
	}
	//console.log(button_list);
	return button_list;
};