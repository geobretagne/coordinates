Ext.namespace("GEOR.Addons");

GEOR.Addons.geob_coordinates = Ext.extend(GEOR.Addons.Base, {    
    control: null,
    item: null,
    layer: null,
    action: null,
    toolbar: null,
    infos: [],
    _coordinatesLayer: null,  
    _mask_loader: null,
    
    _createDrawControl: function () {
            var drawPointCtrl = new OpenLayers.Control.DrawFeature(this._coordinatesLayer, OpenLayers.Handler.Point, {
                featureAdded: function (feature) {
                    this.scope.infos.push(new GEOR.Addons.coordinatesquery(this.scope.map,feature,this.scope.options.services));
                    this.scope.control.deactivate();
                    drawPointCtrl.deactivate();
                },
                scope: this
            });
           drawPointCtrl.deactivate();
           return drawPointCtrl;
        },
    _activateControl: function () {
       this.control.activate();
       this.map.setLayerIndex( this._coordinatesLayer, this.map.layers.length-1);
    },
    
    _showInfos: function (e) {
        console.log("Coordonnées",e.feature.coordinates);
    },
    

         activateTool: function() {
            this.action = new Ext.Action({handler: this._activateControl,scope:this,iconCls: 'coordinates-icon' });
            this.toolbar  = (this.options.placement === "bottom") ? Ext.getCmp("mappanel").bottomToolbar : Ext.getCmp("mappanel").topToolbar;         
            this.toolbar.insert(parseInt(this.options.position),'-');
            this.toolbar.insert(parseInt(this.options.position),this.action);
            this.toolbar.doLayout();
        },
         deactivateTool: function() {
            this.toolbar.remove(this.action.items[0]);
            this.toolbar.remove(this.toolbar.items.items[this.options.position]);
         },        
        onCheckchange: function(item, checked) {
            if (checked) {
               this.activateTool();
            } else {
               this.deactivateTool();
            }
        },       

        init: function (record) {            
            var lang = OpenLayers.Lang.getCode();
            title = record.get("title")[lang];
             var _style = {
                externalGraphic: "ws/addons/geob_coordinates/img/target.png",
                graphicWidth: 16,
                graphicHeight: 16
                };
            var _styleMap = new OpenLayers.StyleMap({'default': _style, 'temporary': _style});
            this._coordinatesLayer = new OpenLayers.Layer.Vector("coordinates", {
                displayInLayerSwitcher: false,
                styleMap: _styleMap
            });
            this.layer = this._coordinatesLayer;            
            
            this.map.addLayers([this._coordinatesLayer]);
            this.control = this._createDrawControl();           
               
            this.map.addControl(this.control);
            
            var item = new Ext.menu.CheckItem({
                text: title,
                hidden:(this.options.showintoolmenu ===true)? false: true,                
                checked: this.options.autoactivate,
                qtip: record.get("description")[lang],
                listeners: {
                    "checkchange": this.onCheckchange,
                    scope: this
                }
               
            });
            if (this.options.autoactivate === true) { this.activateTool();}            
            this.item = item;
            return item;
        },
        destroy: function () {
            this.map = null;
            this.control.deactivate();
            this.control.destroy();
            this.control = null;
            this.item = null;
            this.layer.destroy();
            Ext.each(this.infos, function(w, i) {w.destroy();});
            this.toolbar.remove(this.action.items[0]);
            this.toolbar.remove(this.toolbar.items.items[this.options.position]);
            this.options = null;
            GEOR.Addons.Base.prototype.destroy.call(this);
        }
 });