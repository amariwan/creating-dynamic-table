class createTable {
	constructor(params) {
		var self = this;
		self.headerClick = params.headerClick;
		self.paramColumns = ko.observableArray(params.columns);
		self.paramData = ko.observableArray(params.data);
		self.paramFieldKey = ko.observable(params.fieldKey || 'field');
		self.paramDisplayNameKey = ko.observable(params.displayNameKey || 'displayName');
		self.paramSort = ko.observable('agentenstatusID');
		self.isFolded = ko.observable(true);

		self.fold = (value) => {
			let isF = self.isFolded();
			if (value == self.paramSort()) {
				self.isFolded(!isF);
			} else {
				self.isFolded(true);
			}
		};

		self.koColumnHeaders = () => {
			var columns = self.paramColumns();
			var columnHeaders = [];
			// var fieldKey = ko.unwrap(self.paramFieldKey());
			// var displayNameKey = ko.unwrap(self.paramDisplayNameKey());
			columns.forEach((column) => {
				columnHeaders.push({
					field: column,
					displayName: column,
					fold: () => {
						self.fold(column);
						self.paramSort(column);
						self.koRows();
						self.headerClick();
					},
				});
			});
			return columnHeaders;
		};

		self.koRows = () => {
			var data = self.paramData().slice(0, 50);
			var columns = self.paramColumns();
			var rows = [];
			if (self.isFolded() == true) {
				self.sort(data, self.sortA_Z);
			} else {
				self.sort(data, self.sortZ_A);
			}
			for (var i in data) {
				var datum = data[i];
				var cells = [];

				var row = {
					cells: cells,
				};
				for (var j in columns) {
					var column = columns[j];
					cells.push(datum[column]);
				}
				rows.push(row);
			}
			return rows;
		};

		self.sortA_Z = (x, y) => {
			var paramSort = self.paramSort();
			return x[paramSort] > y[paramSort];
		};

		self.sortZ_A = (x, y) => {
			var paramSort = self.paramSort();
			return x[paramSort] < y[paramSort];
		};

		self.sort = (liste, fnSort) => {
			while (true) {
				var i = 0;
				var fertig = true;
				while (i < liste.length - 1) {
					var zahl1 = liste[i];
					var zahl2 = liste[i + 1];
					if (fnSort(zahl1, zahl2)) {
						liste[i] = zahl2;
						liste[i + 1] = zahl1;
						fertig = false;
					}
					i++;
				}
				if (fertig) {
					break;
				}
			}
		};
		self.init = () => {
			// self.rows(self.koRows());
		};
		self.init();
	}
}
