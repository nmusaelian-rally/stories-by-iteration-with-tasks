Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    items:{ html:'<a href="https://help.rallydev.com/apps/2.0rc2/doc/">App SDK 2.0rc2 Docs</a>'},
    launch: function() {
        var iComboBox = Ext.create('Rally.ui.combobox.IterationComboBox',{
   		listeners:{
   			ready: function(combobox){
   				var iRef = combobox.getRecord().get('_ref'); 
   				this._onStoriesLoaded(iRef);
   			},
   			select: function(combobox){
   				var iRef = combobox.getRecord().get('_ref'); 
   				this._onStoriesLoaded(iRef);
   			},
   			scope: this 
   		}
   	});
   	this.add(iComboBox);
    },
    
     _onStoriesLoaded: function(iRef){
   	console.log('loading stories for ', iRef);
   	
   	var _store = Ext.create('Rally.data.WsapiDataStore',{
   		model: 'User Story',
   		autoLoad:true,
   		fetch: ['Name','ScheduleState','FormattedID', 'Tasks'],
   		filters:[
   			{
   				property : 'Iteration',
   				operator : '=',
   				value : iRef
   			}
   		],
   		listeners: {
   			load: function(store,records,success){
   				console.log("loaded %i records", records.length);
   				this._updateGrid(_store);
   			},
   			scope:this
   		}
   	});
   },
   
   _updateGrid: function(_store){
   	if(this._grid === undefined){
   		this._createGrid(_store);
   	}
   	else{
   		this._grid.reconfigure(_store);
   	}
   },
   
    _createGrid: function(_store){
   	console.log("load grid", _store);
   	this._grid = Ext.create('Ext.grid.Panel', {
   		title: 'Stories by Iteration',
   		store: _store,
   		columns: [
   		        {text: 'ID', dataIndex: 'FormattedID', flex: 1},
   			{text: 'Story Name', dataIndex: 'Name', flex: 2},
   			{text: 'Schedule State', dataIndex: 'ScheduleState', flex: 2}
   		],
   		height: 400
   	});
   	this.add(this._grid);
   }
   
   
});
