Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    items:{ html:'<a href="https://help.rallydev.com/apps/2.0rc2/doc/">App SDK 2.0rc2 Docs</a>'},
    launch: function() {
        var iComboBox = Ext.create('Rally.ui.combobox.IterationComboBox',{
   		listeners:{
   			ready: function(combobox){
   				var iRef = combobox.getRecord().get('_ref'); 
   				this._getData(iRef);
   			},
   			select: function(combobox){
   				var iRef = combobox.getRecord().get('_ref'); 
   				this._getData(iRef);
   			},
   			scope: this 
   		}
   	});
   	this.add(iComboBox);
    },
    
     _getData: function(iRef){
        console.log('loading stories for ', iRef);
   	Ext.create('Rally.data.WsapiDataStore',{
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
   			load: this._onDataLoaded,
   			scope:this
   		}
   	});
     },
     
    _onDataLoaded: function(store, data){
        console.log('onDataLoaded ', data);
        var stories = [];
        var pendingTasks = data.length;
        
        _.each(data, function(story) {
            var owner = story.get('Owner');
            var s  = {
                FormattedID: story.get('FormattedID'),
                Name: story.get('Name'),
                _ref: story.get("_ref"),
                Owner: (owner && owner._refObjectName) || 'None',
                TaskCount: story.get('Tasks').Count,
                Tasks: []
            };
                    
            var tasks = story.getCollection('Tasks');
            tasks.load({
                fetch: ['FormattedID','Estimate'],
                callback: function(records, operation, success){
                    _.each(records, function(task){
                        s.Tasks.push({_ref: task.get('_ref'),
                                        FormattedID: task.get('FormattedID')
                                    });
                    }, this);
                    
                    --pendingTasks;
                    if (pendingTasks === 0) {
                        this._createGrid(stories);
                    }
                },
                scope: this
            });
            stories.push(s);
                    
        }, this);
                
    },
     _createGrid: function(stories) {
        
        if(this.down('#storyGrid')){
            this.down('#storyGrid').destroy();
        }
        console.log('stories', stories);
         this.add({
            xtype: 'rallygrid',
            itemId: 'storyGrid',
            store: Ext.create('Rally.data.custom.Store', {
                data: stories,
                pageSize: 100
            }),
            
            columnCfgs: [
                {
                   text: 'Formatted ID', dataIndex: 'FormattedID', xtype: 'templatecolumn',
                    tpl: Ext.create('Rally.ui.renderer.template.FormattedIDTemplate')
                },
                {
                    text: 'Name', dataIndex: 'Name'
                },
                {
                    text: 'Owner', dataIndex: 'Owner'
                },
                {
                    text: 'Task Count', dataIndex: 'TaskCount'
                },
                {
                    text: 'Tasks', dataIndex: 'Tasks', 
                    renderer: function(value) {
                        var html = [];
                        Ext.Array.each(value, function(task){
                            html.push('<a href="' + Rally.nav.Manager.getDetailUrl(task) + '">' + task.FormattedID + '</a>')
                        });
                        return html.join(', ');
                    }
                }
            ]
            
        });
    }
    
    
    
 /*   
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
 */  
   
});
