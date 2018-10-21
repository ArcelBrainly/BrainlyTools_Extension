const groupLi = group => {
	let groupLen = group.members.length;
	let $conversation = $(`
	<li class="sg-list__element js-group-conversation${group.pinned?" pinned":""}" data-group-id="${group._id}">
		<div class="js-conversation-content sg-media sg-media--clickable ">
			<div class="sg-media__aside">
				<label class="sg-text sg-text--xxlarge js-first-letter" style="color:${group.color};">${group.title.charAt(0).toLocaleUpperCase(System.data.Brainly.defaultConfig.user.ME.user.isoLocale)}</label>
			</div>
			<div class="sg-media__wrapper">
				<div class="sg-media__content sg-media__content--small">
					<div class="sg-text sg-text--obscure sg-text--gray-secondary sg-text--emphasised">
						<ul class="sg-breadcrumb-list sg-breadcrumb-list--adaptive sg-breadcrumb-list--short">
							<li class="sg-breadcrumb-list__element" style="color:${group.color};">${group.title}</li>
							<li class="sg-breadcrumb-list__element"><time class="js-time" datetime="${group.lastMessage ? group.lastMessage.time : ""}"></time></li>
							<li class="sg-breadcrumb-list__element"><i>${System.data.locale.messages.groups.nUser.replace("%{n}", groupLen)}</i></li>
						</ul>
						<span class="js-pin">
							${System.data.config.pinIcon.replace(/\{size\}/g, 22)}
						</span>
					</div>
				</div>
				<div class="sg-media__content js-message-content">${group.lastMessage ? group.lastMessage.message : ""}</div>
			</div>
		</div>
	</li>`);

	return $conversation
}

export default groupLi
