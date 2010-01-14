var YToolbarRowTC = new YAHOO.tool.TestCase({
        name: 'YToolbarRow class tests',
        setUp: function () {
            /*
            this.r1 = new YUI_toolbar_row('szerokość', 100, 'Number');
            this.r2 = new YUI_toolbar_row('wysokość', 200, 'Number');
            this.r3 = new YUI_toolbar_row('jednostka', 'px', 'PxPt');
            this.r4 = new YUI_toolbar_row('format', 'jpg', 'ImageFormat');
            this.r5 = new YUI_toolbar_row('rozmiar (kb)', 241, 'Number');
            this.r6 = new YUI_toolbar_row('skalowanie', 'tak', 'YesNo');

            this.toolbar = new YUI_toolbar(YAHOO.util.Dom.get('toolbar_cnt'), [
                this.r1, this.r2, this.r3, this.r4, this.r5, this.r6
            ]);
            this.assert = YAHOO.util.Assert;
            */
        },
        tearDown : function () {
            //this.toolbar.destroy();
        },
        /*
        testSetGetValue : function () {
            this.assert.areEqual(this.toolbar.get('wysokość').getValue(), 200);
            this.toolbar.setValue('wysokość', 300);
            var row = this.toolbar.get('wysokość');
            this.assert.areEqual(row.getName(), 'wysokość');
            this.assert.areEqual(row.getValue(), 300);
            this.assert.areEqual(row.getType(), 'Number');
        },
        testMarkUnmark: function() {
            this.toolbar.mark('wysokość');
            var rowEl = this.toolbar.getRowEl('wysokość'),
                td = rowEl.getElementsByTagName('td')[1];
            this.assert.isTrue(YAHOO.util.Dom.hasClass(td, 'mark'));
            this.toolbar.unmark('wysokość');
            this.assert.isFalse(YAHOO.util.Dom.hasClass(td, 'mark'));
        },
        testYUItoolbarRow: function() {
            this.r6.setValue('nie');
            this.assert.areEqual(this.r6.getValue(), 'nie');
            this.assert.areEqual(this.toolbar.getValue('skalowanie'), 'nie');
        }*/
});

var YToolbarTC = new YAHOO.tool.TestCase({
    name: 'YToolbar class tests',
    setUp: function() {
        this.Assert = YAHOO.util.Assert;
        this.Dom = YAHOO.util.Dom;
    },
    tearDown: function() {},
    testCreateToolbar: function() {
        this.r1 = new YToolbarRow('width', 100, 'Number');
        this.r2 = new YToolbarRow('height', 200, 'Number');
        this.toolbar = new YToolbar(this.Dom.get('toolbar_cnt'), [
            this.r1, this.r2
        ]);
        this.Assert.areEqual(this.toolbar.get('width'), this.r1);
        this.Assert.areEqual(this.toolbar.get('height'), this.r2);
        this.Assert.areEqual(this.r1._toolbar, this.toolbar);
        this.Assert.areEqual(this.r2._toolbar, this.toolbar);
        this.toolbar.destroy();

        this.toolbar = new YToolbar(this.Dom.get('toolbar_cnt'), []);
        this.toolbar.destroy()
    },
    testAddMethod: function() {
        this.toolbar = new YToolbar(this.Dom.get('toolbar_cnt'), []);
        this.r1 = new YToolbarRow('width', 100, 'Number');
        this.toolbar.add(this.r1);
        this.Assert.areEqual(this.toolbar.get('width'), this.r1);
        this.Assert.areEqual(this.r1._toolbar, this.toolbar);
        this.toolbar.destroy() 
    },
    testRemoveMethod: function() {
        this.r1 = new YToolbarRow('width', 100, 'Number');
        this.toolbar = new YToolbar(this.Dom.get('toolbar_cnt'), [this.r1]);
        this.toolbar.remove('width');
        this.Assert.areEqual(this.toolbar.get('width'), null);
        this.Assert.areEqual(this.r1._toolbar, null);
        this.toolbar.destroy();
    }
});
