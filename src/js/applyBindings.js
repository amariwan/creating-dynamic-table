let aktionenClass = new aktionen();

$(document).ready(() => {
	ko.applyBindings(aktionenClass, document.getElementById('Table'));
});
const loaded = async () => {
	if (!(await aktionenClass.init())) {
		console.log('error');
		return;
	}
};
loaded();
