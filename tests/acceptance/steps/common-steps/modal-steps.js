export function removeExistingModals() {
	let modalBackdrop = document.querySelectorAll('.modal-backdrop.fade.in') || [];
	modalBackdrop.forEach((backdrop) => {
		backdrop.remove();
	});
}