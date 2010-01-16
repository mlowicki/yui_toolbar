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

/**
 * 
 * Parameters:
 *  name {String}
 *  value {MIXED}
 *  type {String}
 */
YToolbarRow =function(name, value, type, onChange) {
    this._name = name;
    this._value = value;
    if(!(YToolbar.prototype.TYPES.contains(type))) {
        throw new Error('Unrecognized type ' + type);
    }
    this._type = type;
    this._onChange = onChange;
    this._toolbar = null;
};

YToolbarRow.prototype = {
    /**
     * Return:
     *  {String}
     */
    getName: function() {
        return this._name;
    },
    /**
     * Return:
     *  {MIXED}
     */
    getValue: function() {
        return this._value;
    },
    /**
     * Return:
     *  {String}
     */
    getType: function() {
        return this._type;
    },
    /**
     * set value and update toolbar
     *
     * Parameters:
     *  value {MIXED}
     * 
     * Return:
     *  {Boolean}
     */
    setValue: function(value) {
        if(this._toolbar._setTableRow(this.getName(), value)) {
            var old = this._value;
            this._value = value;
            this._onChange.fn.call(this._onChange.scope, value, old);
            return true;
        }
        return false;
    },
    onChange: function(o) {
        this._onChange = o;
    },
    setName: function(name) {

    },
    getEl: function() {
        var row = this._toolbar._getTableRow(this.getName());
        return  YAHOO.util.Dom.get(row.getId());
    },
    getNameEl: function() {
        var row = this._toolbar._getTableRow(this.getName());
        return  YAHOO.util.Dom.get(row.getId()).getElementsByTagName('td')[0];
    },
    getValueEl: function() {
        var row = this._toolbar._getTableRow(this.getName());
        return  YAHOO.util.Dom.get(row.getId()).getElementsByTagName('td')[1];
    },
    /**
     * Mark row element (add 'mark' class to the tr element)
     */
    mark: function() {
        YAHOO.util.Dom.addClass(this.getEl(), 'mark');
    },
    /**
     * Unmark row element (remove 'mark' class from the tr element)
     */
    unmark: function() {
        YAHOO.util.Dom.removeClass(this.getEl(), 'mark');
    },
    /**
     * Mark name element (add 'mark' class to the td element)
     */
    markName: function() {
        YAHOO.util.Dom.addClass(this.getNameEl(), 'mark');
    },
    /**
     * Unmark name element (remove 'mark' class from the td element)
     */
    unmarkName: function() {
        YAHOO.util.Dom.removeClass(this.getNameEl(), 'mark');
    },
    /**
     * Mark value element (add 'mark' class to the td element)
     */
    markValue: function() {
        YAHOO.util.Dom.addClass(this.getValueEl(), 'mark');
    },
    /**
     * Unmark value element (remove 'mark' class from the td element)
     */
    unmarkValue: function() {
        YAHOO.util.Dom.removeClass(this.getValueEl(), 'mark');
    }
};

// shortcuts
YToolbarRow.prototype.set = YToolbarRow.prototype.setValue;
YToolbarRow.prototype.get = YToolbarRow.prototype.getValue;

YToolbar = function(parent, rows, cfg) {
    this._parent = parent;
    this._initRows = rows;
    this._rows = [];
    this._cfg = cfg || {};
    this._nameLabel = this._cfg.nameLabel || 'name';
    this._valueLabel = this._cfg.valueLabel || 'value';
    if(this._cfg.sortable === undefined) { // sortable is true by default
        this._cfg.sortable = true;
    }
    this.init();
};

YToolbar.prototype = {
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
    /**
     * create YUI datetable
     */
    _tableInit: function() {
        this._columnDefs = [
            {key: 'name', label: this._nameLabel, sortable: this._cfg.sortable, },
            {key: 'value', label: this._valueLabel,
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
        this._dt.subscribe('rowMouseoverEvent', this._dt.onEventHighlightRow);
        this._dt.subscribe('rowMouseoutEvent', this._dt.onEventUnhighlightRow);
        var that = this;
        //Dom.setStyle(this._dt.getTheadEl(), 'display', 'none');
        
        this._dt.subscribe('cellClickEvent', function (oArgs) {
            var target = oArgs.target,
                record = this.getRecord(target),
                column = this.getColumn(target),
                type = record.getData('type');
            if(column.field != 'name') {
                column.editor = that._EDITORS[type];
                this.showCellEditor(target);
            }
        });
        
        this._dt.subscribe('cellUpdateEvent', function(o) {
            if(o.record.getData().value !== o.oldData) {
                console.debug('no change');
            }
        });
    },
    /**
     * init DOM nodes
     */
    _skeletonInit: function() {
        this._root = document.createElement('div');
        this._rootEl = new Element(this._root);
        this._rootEl.addClass('toolbar');
        this._rootEl.appendTo(this._parent);
        /* table container */
        this._table = document.createElement('div');
        this._tableEl = new Element(this._table);
        this._tableEl.appendTo(this._rootEl);
    },
    _getTableRow: function(name) {
        var index = this._findTableRow(name);
        if(index != null) {
            return  this._dt.getRecordSet().getRecords()[index];
        }
        else {
            return null;
        }
    },
    _findTableRow: function(name) {
        var rows = this._dt.getRecordSet().getRecords();
        for(var i=0; i < rows.length; i++) {
            if(rows[i].getData().name == name) {
                return i;
            }
        }
        return null;
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
    _setTableRow: function(name, value) {
        var row = this._getTableRow(name);
        if(row === null) return false;
        this._dt.updateRow(row,
                {name: name, value: value, type: row.getData()['type']});
        return true;
    },
    /**
     * get row for a given property
     *
     * Parameters:
     *  name {String}
     *
     * Return:
     *  {YToolbarRow}
     */
    get: function(name) {
        for(var i=0; i < this._rows.length; i++) {
            if(this._rows[i].getName() === name) {
                return this._rows[i];
            }
        }
        return null;
    },
    /**
     * initialize toolbar with given data
     */
    _dataInit: function() {
        for(var i=0; i < this._initRows.length; i++) {
            this.add(this._initRows[i]);
        }
    },
    addAfter: function(row, name) {
    
    },
    addBefore: function(row, name) {

    },
    /**
     * Add row to the table
     * 
     * Parameters:
     *  row {YToolbarRow}
     *  index {Number}
     */
    add: function(row, index) { 
        row._toolbar = this;
        if(YAHOO.lang.isNumber(index)) {
            // TODO
        }
        else {
            this._rows.push(row);
            this._dt.addRow({
                name: row.getName(), 
                value: row.getValue(),
                type: row.getType()
            });
        }
    },
    remove: function(name) {
        var row = this.get(name);
        row._toolbar = null;
        for(i=0; i < this._rows.length; i++) {
            if(this._rows[i] === row) {
                this._rows.splice(i, 1);
            }
        }
    },
    /**
     * destroy toolbar
     */
    destroy: function() {
        this._dt.destroy();
    },
    init: function() {
        this._skeletonInit();
        this._tableInit();
        this._dataInit();
    }
};
