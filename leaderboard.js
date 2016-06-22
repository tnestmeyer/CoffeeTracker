// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players."

Players = new Meteor.Collection("players");


Router.configure({
 	layoutTemplate: 'ApplicationLayout',
	    templateNameConverter: 'upperCamelCase'
 	    });

Router.map(function() {
	this.route('players', {path: '/'  });
	this.route('admin', {template: 'Admin',  path: '/admin'  });
    });





espresso_price = 0.25
latte_price = 0.35
prepaid_price = 1.0

if (Meteor.isClient) {

  Validation = {
    clear: function () {
      return Session.set("error", undefined);
    },
    set_error: function (message) {
      return Session.set("error", message);
    },
    valid_name: function (name) {
      this.clear();
      if (name.length == 0) {
        this.set_error("Person's name can't be blank");
        return false;
      } else if (this.player_exists(name)) {
        this.set_error("Person already exists");
        return false;
      } else {
        return true;
      }
    },
    player_exists: function(name) {
      return Players.findOne({name: name});
    }
  };

  Template.leaderboard.helpers({
    players_active: function () {
        window.alert('test')
        console.log('test')
        return Players.find({active: { '$mod' : [2,1]}}, {sort: {total: -1, name: 1}});
    },

    players: function () {
        window.alert('test')
        console.log('test')
        return Players.find( {}, {sort: {total: -1, name: 1}});
    },

    selected_name: function () {
      var player = Players.findOne(Session.get("selected_player"));
      return player && player.name;
    },

    selected_tab: function () {
        var player = Players.findOne(Session.get("selected_player"));
        var tab = (espresso_price * player.etab) + (latte_price * player.ltab) - (prepaid_price * player.ptab);
        return player && tab.toFixed(2);
    },

    totalfruit: function () {
        var fruits = Players.find({});
        var sum = 0;
        fruits.forEach(function(Player){
          sum += Player.total;
        });
        return sum;
    },

  });


  Template.stats.helpers({
    totalfruit: function () {
        var fruits = Players.find({});
        var sum = 0;
        fruits.forEach(function(Player){
          sum += Player.total;
        });
        return sum;
    },

    totalsum: function () {
        var fruits = Players.find({});
        var sum = 0;
        fruits.forEach(function(Player){
          sum += (espresso_price * Player.etab) + (latte_price * Player.ltab) - (prepaid_price * Player.ptab);
        });
        return sum.toFixed(2);
    },

    totalowed: function () {
        var fruits = Players.find({});
        var sum = 0;
        fruits.forEach(function(Player){
  	      sum += Math.max( 0, (espresso_price * Player.etab) + (latte_price * Player.ltab) - (prepaid_price * Player.ptab));
  	  });
        return sum.toFixed(2);
    },

    totalprepay: function () {
        var fruits = Players.find({});
        var sum = 0;
        fruits.forEach(function(Player){
          sum += (prepaid_price * Player.ptab);
        });
        return sum.toFixed(2);
    },

  });

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.player_admin.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.player_admin.notactv = function () {
      return ((this.active % 2)==0)  ? "notactv" : '';
  };

  Template.newplayer.helpers({
    error: function () {
      return Session.get("error");
    },

  });

  Template.newplayer.events = {
      'click input.add': function () {
        var newplayer = document.getElementById("newplayer").value.trim();
        if (Validation.valid_name(newplayer)) {
          Players.insert({name: newplayer, etab: 0, ltab: 0, ptab: 0, total: 0, active: 1});
        }
      }
  };

  Template.leaderboard.events = {
      'click input.einc': function () {
        Players.update(Session.get("selected_player"), {$inc: {etab: 1, total: 1}});
      },
      'click input.linc': function () {
        Players.update(Session.get("selected_player"), {$inc: {ltab: 1, total: 1}});
      },
      'click input.pinc': function () {
        Players.update(Session.get("selected_player"), {$inc: {ptab: 1, total: 0}});
      },
      'click input.psub': function () {
        Players.update(Session.get("selected_player"), {$inc: {ptab: -1, total: 0}});
      },
      'click input.cleartab': function () {
        Players.update(Session.get("selected_player"), {$set: {ltab: 0, etab: 0, ptab: 0}});
      },
      'click input.actv': function () {
        Players.update(Session.get("selected_player"), {$inc: {active: 1}})
      }
  };

  Template.player.events = {
    'click': function () {
      Session.set("selected_player", this._id);
    }
  };

  Template.player_admin.events = {
      'click': function () {
        Session.set("selected_player", this._id);
      }
  };
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["MJB",
                   "Peter",
                   "Andreas G.",
                   "Jon",
                   "Javier",
                   "Naureen",
                   "Jonas",
                   "Thomas N.",
                 ];
      for (var i = 0; i < names.length; i++)
        Players.insert(
          {name: names[i], etab: 0, ltab: 0, ptab: 0, active: 1, total: 0}
        );
    }

/*
    collectionApi = new CollectionAPI({
      authToken: undefined,              // Require this string to be passed in on each request
      apiPath: 'rest'                    // API path prefix
    });

    // Add the collection Players to the API "/players" path
    collectionApi.addCollection(Players, 'players', {
      methods: ['GET']  // Allow reading
    });

    // Starts the API server
    collectionApi.start();
*/


    // Meteor.publish("widgets-above-index", function (index) {
    //   return Widgets.find({index: {$gt: parseInt(index, 10)}});
    // }, {
    //   url: "widgets-with-index-above/:0",
    //   httpMethod: "post"
    // });


    });
}
