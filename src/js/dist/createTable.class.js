class createTable {
	constructor(params) {
		var self = this;
		self.updateRows = params.updateRows;
		self.paramColumns = ko.observableArray(params.columns);
		self.paramData = ko.observableArray(params.data);
		self.updateParamData = ko.observableArray(params.data);
		self.paramFieldKey = ko.observable(params.fieldKey || 'field');
		self.paramDisplayNameKey = ko.observable(params.displayNameKey || 'displayName');
		self.paramSort = ko.observable('agentenstatusID');
		self.isFolded = ko.observable(true);
		// Search for a specific value in a nested object and return the key path
		self.searchTxt = ko.observable();
		self.searchLst = ko.observableArray([]);
		self.searchTxtLst = ko.observableArray([]);
		self.searchObject = function () {};

		self.search = (searchTxt, property) => {
			var lst = self.paramData();
			var item = {
				Text: searchTxt,
				Property: property,
			};
			var t = self.searchLst().some((item) => item.Property === property);
			if (searchTxt != '' && property.length != null && property.length != 0 && t != true) {
				self.searchLst.push(item);
			} else if (searchTxt == '' && searchTxt.length == 0) {
				var array = self.removeItemByKey(self.searchLst(), 'Property', item.Property);
				self.searchLst(array);
			} else {
				var array = self.removeItemByKey(self.searchLst(), 'Property', item.Property);
				self.searchLst(array);
				self.searchLst.push(item);
			}
			if (self.searchLst().length > 0) {
				for (let i = 0; i < self.searchLst().length; i++) {
					const element = self.searchLst()[i];
					lst = self.filterNode(lst, element.Property, element.Text);
				}
			} else {
				lst = self.paramData();
			}

			return lst;
		};

		self.filterNode = function (nodes, parts, searchText) {
			var lst = [];
			parts = parts.split('.');

			searchText = searchText.toLowerCase();
			if (typeof nodes == 'undefined' && typeof nodes != 'object') {
				console.error('nodes is not an object');
				return;
			}
			for (let index = 0; index < nodes.length; index++) {
				const e = nodes[index];
				let keys = Object.keys(e);
				var x = 0;
				for (let i = 0; i < keys.length; i++) {
					var key = keys[i];
					if (typeof key == 'object') {
						if (typeof keys[i] == 'object') {
							let sublst = self.filterNode(e[keys[i]], parts[x], searchText);
							if (sublst != null) {
								sublst.forEach((x) => {
									lst.push(x);
								});
							}
						}
					} else {
						if (key == parts[x]) {
							var lNode = e[key];
							// if (e[key] != null) {
							// }
							if (lNode == null) {
								if (self.searchInSubNode(e[key], searchText, parts, x)) {
									lst.push(e);
								}
							} else {
								if (self.searchInNode(lNode, searchText)) {
									lst.push(e);
								}
							}
						}
					}
				}
			}
			console.log(lst);
			return lst;
		};

		// Search in a subnode
		self.searchInSubNode = function (items, searchText, parts, x) {
			if (items != null) {
				++x;
				for (let y = 0; y < items.length; y++) {
					const element = items[y];
					var lNodeText = element[parts[x]];
					if (lNodeText != null && typeof lNodeText == 'string') {
						lNodeText = lNodeText.toLowerCase();
						if (lNodeText.includes(searchText)) {
							return true;
						}
					} else if (typeof lNodeText == 'object') {
						if (self.searchInSubNode(lNodeText, searchText, parts, x)) {
							return true;
						}
					}
				}
			}
			return false;
		};

		self.searchInNode = function (item, searchText) {
			item = String(item);
			/* Converting the item to lower case. */
			item = item.toLowerCase();
			/* Checking if the searchText is in the item. */
			if (item.includes(searchText)) {
				return true;
			}
			return false;
		};

		self.koColumnHeaders = (columns) => {
			var columnHeaders = [];
			columns.forEach((column) => {
				columnHeaders.push({
					field: column,
					displayName: column,
					fold: () => {
						self.fold(column);
						self.paramSort(column);
						self.updateRows(self.koRows(self.updateParamData()));
					},
					searchObject: new self.searchObject(),
					searchInput: ko.pureComputed({
						read: function () {
							return '';
						},
						write: function (Text) {
							self.updateParamData(self.search(Text, column));
							self.updateRows(self.koRows(self.updateParamData()));
						},
						owner: this,
					}),
				});
			});
			return columnHeaders;
		};

		self.koRows = (data) => {
			var columns = self.paramColumns();
			var rows = [];
			self.sort(data, self.isFolded() ? self.sortA_Z : self.sortZ_A);
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

		self.fold = (value) => {
			let isF = self.isFolded();
			if (value == self.paramSort()) {
				self.isFolded(!isF);
			} else {
				self.isFolded(true);
			}
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

		self.removeItemByKey = (array, key, value) => {
			var i = 0;
			while (i < array.length) {
				if (array[i][key] === value) {
					array.splice(i, 1);
				} else {
					++i;
				}
			}
			return array;
		};
	}
}
