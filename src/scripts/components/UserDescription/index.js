export default description => {
	let $userDescription = $(`
	<div class="userDescription" title="${System.data.locale.texts.profile.userDescription.description}">
		<b>${System.data.locale.texts.profile.userDescription.title} </b>
		<span>${description || " -"}</span>
	</div>`);

	$userDescription.insertBefore("#main-left > div.personal_info > div.helped_info")
}
