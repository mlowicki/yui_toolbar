/**
 * TODO
 * - add tooltips to the rows/values/names
 */
var Dom = YAHOO.util.Dom,
    Event = YAHOO.util.Dom,
    Element = YAHOO.util.Element;

Array.prototype.contains = function(obj) {  
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

YUI_toolbar_row =function(name, value, type) {
    this._name = name;
    this._value = value;
    if(!(YUI_toolbar.prototype.TYPES.contains(type))) {
        throw new Error('Unrecognized type ' + type);
    }
    this._type = type;

};

YUI_toolbar_row.prototype = {
    getName: function() {
        return this._name;
    },
    getValue: function() {
        return this._value;
    },
    getType: function() {
        return this._type;
    }
};

YUI_toolbar = function(parent, rows, cfg) {
    this._parent = parent;
    this._rows = rows;
    this._cfg = cfg || {};
    if(this._cfg.sortable === undefined) { // sortable is true by default
        this._cfg.sortable = true;
    }
    this.init();
};

YUI_toolbar.prototype = {
    _editorsInit: function() {
        YAHOO.widget.TextboxCellEditor.prototype.LABEL_SAVE = 'ok';
        YAHOO.widget.TextboxCellEditor.prototype.LABEL_CANCEL = 'anuluj';
        this._EDITORS = {
            Text: new YAHOO.widget.TextboxCellEditor(),
            Number: new YAHOO.widget.TextboxCellEditor(
                {validator:function (val) {
                    val = parseFloat(val);
                    if (YAHOO.lang.isNumber(val)) {return val;}
            }}),
            ImageFormat: new YAHOO.widget.RadioCellEditor({
                radioOptions: ['jpg', 'png', 'bmp', 'gif'], disableBtns: true}),
            PxPt: new YAHOO.widget.RadioCellEditor({
                radioOptions: ['px', 'pt'], disableBtns: true}),
            YesNo: new YAHOO.widget.RadioCellEditor({
                radioOptions: ['tak', 'nie'],disableBtns: true})
        };
    },
    TYPES: ['Number', 'Text', 'ImageFormat', 'YesNo', 'PxPt'],
    _formatterDispatcher: function(elCell, oRecord, oColumn, oData) {
        var type = oRecord.getData('type');
        oColumn.editorOptions = type.editorOptions;
        switch (type) {
            case 'Number':
                YAHOO.widget.DataTable.formatNumber.call(this, elCell, oRecord,
                                                         oColumn,oData);
                break;
            case 'Date':
                YAHOO.widget.DataTable.formatDate.call(this, elCell, oRecord,
                                                        oColumn,oData);
                break;
            case 'Text':
                YAHOO.widget.DataTable.formatText.call(this, elCell, oRecord,
                                                        oColumn,oData);
                break;
            case 'ImageFormat':
            case 'YesNo':
            case 'PxPt':
                elCell.innerHTML = oData;
                break;
         }
    },
    getRowEl: function(name) {
        var row = this.getRow(name);
        if(row != null) {
            return YAHOO.util.Dom.get(row.getId());
        }
        return null;
    },
    markName: function(name) {
        var rowEl = this.getRowEl(name);
        if(rowEl != null) {
            var td = rowEl.getElementsByTagName('td')[0];
            YAHOO.util.Dom.addClass(td, 'mark');
        }
    },
    unmarkName: function(name) {
        var rowEl = this.getRowEl(name);
        if(rowEl != null) {
            var td = rowEl.getElementsByTagName('td')[0];
            YAHOO.util.Dom.removeClass(td, 'mark');
        }
    },
    mark: function(name) {
        var rowEl = this.getRowEl(name);
        if(rowEl != null) {
            var td = rowEl.getElementsByTagName('td')[1];
            YAHOO.util.Dom.addClass(td, 'mark');
        }
    },
    unmark: function(name) {
        var rowEl = this.getRowEl(name);
        if(rowEl != null) {
            var td = rowEl.getElementsByTagName('td')[1];
            YAHOO.util.Dom.removeClass(td, 'mark');
        }
    },
    markRow: function(name) {
        var rowEl = this.getRowEl(name);
        if(rowEl != null) {
            YAHOO.util.Dom.addClass(rowEl, 'mark');
        }
    },
    unmarkRow: function(name) {
        var rowEl = this.getRowEl(name);
        if(rowEl != null) {
            YAHOO.util.Dom.removeClass(rowEl, 'mark');
        }
    },
    _skeletonInit: function() {
        this._root = document.createElement('div');
        this._rootEl = new Element(this._root);
        this._rootEl.addClass('toolbar');
        this._rootEl.appendTo(this._parent);
        /* table container */
        this._table = document.createElement('div');
        this._tableEl = new Element(this._table);
        this._tableEl.appendTo(this._rootEl);
		
		this._columnDefs = [
			{key: 'name', label:'nazwa', sortable: this._cfg.sortable},
			{key: 'value', label: 'wartość', 
                formatter: this._formatterDispatcher,
                editor:new YAHOO.widget.BaseCellEditor()}
		];

		this._ds  = new YAHOO.util.DataSource([]);
		this._ds.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;
		this._ds.responseSchema = {
			fields: ['name','value','type']
		};
        this._editorsInit();
		this._dt = new YAHOO.widget.DataTable(this._table, this._columnDefs,
                                            this._ds);
        this._rowsInit();
        this._dt.subscribe('rowMouseoverEvent', this._dt.onEventHighlightRow); 
        this._dt.subscribe('rowMouseoutEvent', this._dt.onEventUnhighlightRow); 
        var that = this;
        //Dom.setStyle(this._dt.getTheadEl(), 'display', 'none');
        this._dt.subscribe('cellClickEvent', function (oArgs) {
            var target = oArgs.target,
                record = this.getRecord(target),
                column = this.getColumn(target),
                type = record.getData('type');
			column.editor = that._EDITORS[type];
			this.showCellEditor(target);
		});
    },
    /**
     * set value for a given property
     *
     * Parameters:
     *  name {Boolean}
     *  value {MIXED}
     *
     * Return:
     *  {Boolean}
     */
    set: function(name, value) {
        var row = this.getRow(name);
        if(row === null) return false;
        this._dt.updateRow(row,
                {name: name, value: value, type: row.getData()['type']});
        return true;
    },
    /**
     * get value for a given property
     *
     * Parameters:
     *  name {String}
     *
     * Return:
     *  {MIXED}
     */
    get: function(name) {
        var row = this.getRow(name);
        if(row === null) return;
        return row.getData().value; 
    },
    getRow: function(name) {
        var index = this.findRow(name);
        if(index != null) {
            return this._dt.getRecordSet().getRecords()[index];
        }
        else {
            return null;
        }
    },
    findRow: function(name) {
        var rows = this._dt.getRecordSet().getRecords();
        for(var i=0; i<rows.length; i++) {
            if(rows[i].getData().name == name) {
                return i;
            }
        }
        return null;
    },
    _rowsInit: function() {
        for(var i=0; i<this._rows.length; i++) {
            this.addRow(this._rows[i]);
        }
    },
    addRowAfter: function(item, name) {
        var index = this.findRow(name);
        if(index === null) {
            throw new Error('Row with name ' + name + ' not found');
        }
        this.addRow(item, index+1);
    },
    addRow: function(item, index) {
        this._dt.addRow({
            name: item.getName(), 
            value: item.getValue(),
            type: item.getType()
        }, index);
    },
    deleteRow: function(name) {
        var index = this.findRow(name);
        if(index === null) {
            throw new Error('Row with name ' + name + ' not found');
        }
        this._dt.deleteRow(index);
    },
    /**
     * destroy toolbar
     */
    destroy: function() {
        this._dt.destroy();
    },
    init: function() {
        this._skeletonInit();
    }
};
