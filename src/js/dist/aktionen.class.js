class aktionenVM {
    constructor() {
        var self = this;
        var log = console.log;
        self.nodes = ko.observableArray([]);
        self.aktionName = ko.observableArray([]);
        self.propertys = ko.observableArray([]);
        self.recursiveObjects = ko.observableArray([]);
        self.columns = ko.observableArray([]);
        self.rows = ko.observableArray([]);
        // Search for a specific value in a nested object and return the key path
        self.isEnterSearch = ko.observable(false);
        self.searchLst = ko.observableArray([]);
        self.searchTxtLst = ko.observableArray([]);
        self.isSelectedSearchBy = ko.observable('');
        self.searchTxt = ko.observable('');
        self.selectedSearchBy = ko.pureComputed({
            read: function() {
                return '';
            },
            write: function(value) {
                self.isSelectedSearchBy(value);
            },
            owner: this,
        });

        self.searchInput = ko.pureComputed({
            read: function() {
                return self.searchTxt();
            },
            write: function(value) {
                self.searchTxt(value);
            },
            owner: this,
        });

        /* Searching for a text in the nodes. */
        self.search = function(txt) {
            if (txt == null || txt == '') {
                return;
            }
            var item = {
                Propertys: self.isSelectedSearchBy(),
                Value: txt,
            };
            self.searchTxtLst.push(item);
        };

        self.removeSeachTxtLst = function() {
            self.searchTxtLst.remove(this);
            self.createTable(self.nodes(), self.propertys());
        };

        self.enterSearch = function(d, e) {
            if (e.keyCode === 13) {
                this.searchNow();
            }
            return true;
        };

        self.addSearch = function() {
            this.searchNow();
        };

        self.searchNow = function() {
            self.search(self.searchTxt());
            self.searchTxt('');
            var searchLst = self.searchTxtLst();
            if (searchLst.length == null || searchLst.length == 0) {
                return;
            }
            var lst = self.nodes();
            for (let i = 0; i < searchLst.length; i++) {
                const element = searchLst[i];
                lst = self.filterNode(lst, element.Propertys, element.Value);
            }
            self.createTable(lst, self.propertys());
        };

        self.filterNode = function(nodes, parts, searchText) {
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
            return lst;
        };

        // Search in a subnode
        self.searchInSubNode = function(items, searchText, parts, x) {
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

        self.searchInNode = function(item, searchText) {
            item = String(item);
            /* Converting the item to lower case. */
            item = item.toLowerCase();
            /* Checking if the searchText is in the item. */
            if (item.includes(searchText)) {
                return true;
            }
            return false;
        };

        /* A function that returns an array of properties. */
        self.getProperty = function(obj) {
            var results = [];
            Object.keys(obj).forEach((key) => {
                var value = obj[key];
                if (typeof value !== 'object' && !results.includes(key)) {
                    results.push(key);
                } else if (typeof value === 'object') {
                    if (value != undefined && value != null) {
                        self.getProperty(value).forEach((element) => {
                            var newElement = '';
                            if (isNaN(key)) {
                                newElement = key + '.' + element;
                            } else {
                                newElement = element;
                            }
                            if (!results.includes(newElement)) {
                                results.push(newElement);
                            }
                        });
                    }
                }
            });
            return results;
        };

        /* A function that returns an array of properties. */

        self.getAgenten = function(nodes) {
            var lst = [];
            for (let i = 0; i < nodes.agenten.length; i++) {
                const element = nodes.agenten[i];
                var agentenstatusV = self.getAgentenstatus(nodes, element.agentenstatusID);
                var aktionsagentenV = self.getAktionsagenten(nodes, element.agentenID);
                var aktionenV = self.getAktionen(nodes, aktionsagentenV);
                var values = Object.values(element);
                for (let x = 0; x < values.length; x++) {
                    const value = values[x];
                }
                const newitem = {
                    ...element,
                };
                lst.push(newitem);
            }
            return lst;
        };

        self.getAgentenstatus = function(nodes, value) {
            for (let i = 0; i < nodes.agentenstatus.length; i++) {
                const element = nodes.agentenstatus[i];
                if (element.agentenstatusID == value) {
                    return element;
                }
            }
            return null;
        };

        self.getAktionen = function(nodes, value) {
            var lst = [];
            for (let i = 0; i < value.length; i++) {
                const element = value[i];
                for (let j = 0; j < nodes.aktionen.length; j++) {
                    const aktion = nodes.aktionen[j];
                    if (element.aktionsID == aktion.aktionsID) {
                        var produkte = self.getProdukte(nodes, aktion.produktID);
                        var item = {
                            ...aktion,
                            produkte: produkte,
                        };
                        lst.push(item);
                    }
                }
            }
            return lst;
        };

        self.getAktionsagenten = function(nodes, value) {
            var lst = [];
            for (let i = 0; i < nodes.aktionsagenten.length; i++) {
                const element = nodes.aktionsagenten[i];
                if (element.agentenID === value) {
                    lst.push(element);
                }
            }
            return lst;
        };

        self.getProdukte = function(nodes, value) {
            for (let i = 0; i < nodes.produkte.length; i++) {
                const element = nodes.produkte[i];
                if (element.produktID == value) {
                    return element;
                }
            }
            return null;
        };
        // chance
        this.selectedPropertys = ko.observableArray([]);
        this.selectedAllPropertys = ko.pureComputed({
            read: function() {
                console.log(self.selectedPropertys());
                self.createTable(self.nodes(), self.selectedPropertys());
                return self.selectedPropertys().length === self.propertys().length;
            },
            write: function(value) {
                console.log(value);
                self.selectedPropertys(value ? self.propertys.slice(0) : []);
            },
            owner: this,
        });
        /* A function that is called when the data is loaded. */
        self.init = async function() {
            try {
                // loaded data
                var agenten = await self.getJson('src/js/json/agenten.json');
                var agentenstatus = await self.getJson('src/js/json/agentenstatus.json');
                var aktionen = await self.getJson('src/js/json/aktionen.json');
                var aktionsagenten = await self.getJson('src/js/json/aktionsagenten.json');
                var produkte = await self.getJson('src/js/json/produkte.json');
                var json = {
                    agenten: agenten,
                    agentenstatus: agentenstatus,
                    aktionen: aktionen,
                    aktionsagenten: aktionsagenten,
                    produkte: produkte,
                };
                json = self.getAgenten(json);
                self.nodes(json);
                let propertysLst = self.getProperty(json);
                self.propertys(propertysLst);
                self.createTable(json, propertysLst);
                return true;
            } catch (ex) {
                console.log(ex);
                return false;
            }
        };

        self.createTable = (nodes, propertys) => {
            console.log(propertys);
            // Create Table
            self.table = new createTable({
                data: nodes,
                columns: propertys,
                headerClick: self.headerClick,
            });
            self.columns(self.table.koColumnHeaders());
            self.rows(self.table.koRows());
        };

        self.headerClick = () => {
            self.rows(self.table.koRows());
        };

        self.getJson = (path) => {
            return new Promise((resolve) => {
                $.getJSON(path, (data) => {
                    resolve(data);
                });
            });
        };
    }
}