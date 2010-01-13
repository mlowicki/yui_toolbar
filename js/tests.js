var apiTC = new YAHOO.tool.TestCase({
        name : 'API tests',
        setUp : function () {
            this.toolbar = new YUI_toolbar(YAHOO.util.Dom.get('toolbar_cnt'), [
                new YUI_toolbar_row('szerokość', 100, 'Number'),
                new YUI_toolbar_row('wysokość', 200, 'Number'),
                new YUI_toolbar_row('jednostka', 'px', 'PxPt'),
                new YUI_toolbar_row('format', 'jpg', 'ImageFormat'),
                new YUI_toolbar_row('rozmiar (kb)', 241, 'Number'),
                new YUI_toolbar_row('skalowanie', 'tak', 'YesNo')
            ]);
            this.assert = YAHOO.util.Assert;
        },
        tearDown : function () {
            this.toolbar.destroy();
        },
        testSetGetValue : function () {
            this.assert.areEqual(this.toolbar.get('wysokość'), 200);
            this.toolbar.set('wysokość', 300);
            this.assert.areEqual(this.toolbar.get('wysokość'), 300);
        },
        testMarkUnmark: function() {
            this.toolbar.mark('wysokość');
            var rowEl = this.toolbar.getRowEl('wysokość'),
                td = rowEl.getElementsByTagName('td')[1];
            this.assert.isTrue(YAHOO.util.Dom.hasClass(td, 'mark'));
            this.toolbar.unmark('wysokość');
            this.assert.isFalse(YAHOO.util.Dom.hasClass(td, 'mark'));
        }
});
