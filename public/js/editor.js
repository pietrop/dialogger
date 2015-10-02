$(document).ready(function()
{
  // define models and collections
  var userModel = Backbone.Model.extend({
    url: '/api/user'
  });

  var assetModel = Backbone.Model.extend({
    url: '/api/assets/1',
    defaults: {
      name:   null,
      status: null
    }
  });

  var assetCollection = Backbone.Collection.extend({
    url: '/api/assets',
    model: assetModel
  });

  // define views
  var userView = Backbone.View.extend({
    el: '#userView',
    initialize: function() {
      this.listenTo(this.model, 'sync', this.render);
      this.model.fetch();
      this.render();
    },
    render: function() {
      this.$el.html('<i class="user icon"></i>'+this.model.get('username'));
    }
  });

  var assetsListView = Backbone.View.extend({
    el: '#assetsListView',
    template: _.template($('#asset-item-tmpl').html()),
    initialize: function() {
      this.listenTo(this.collection, 'sync', this.render);
      this.collection.fetch();
      this.render();
    },
    render: function() {
      this.$el.html(this.template({collection: this.collection.toJSON()}));
    }
  });

  // initialize models, collections and views
  var assets = new assetCollection();
  var assetsListViewInstance = new assetsListView({collection: assets});

  var user = new userModel();
  var userViewInstance = new userView({model: user});

  // update assets list regularly
  setInterval(function() {
    assets.fetch();
  }, 3000);

  $('.left.sidebar')
  .sidebar({
      context: $('.bottom.segment'),
      exclusive: false,
      transition: 'overlay',
      dimPage: false
  })
  .sidebar('attach events', '#leftButton');

  $('.right.sidebar')
  .sidebar({
      context: $('.bottom.segment'),
      exclusive: false,
      transition: 'overlay',
      dimPage: false
  })
  .sidebar('attach events', '#rightButton');
});
