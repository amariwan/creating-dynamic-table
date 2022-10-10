let aktionenClassVM = new aktionenVM();

$(document).ready(() => {
	ko.applyBindings(aktionenClassVM, document.getElementById('Table'));
});
const loaded = async () => {
	if (!(await aktionenClassVM.init())) {
		console.log('error');
		return;
	}
};
loaded();