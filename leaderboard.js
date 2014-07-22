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
      this.set_error("Connoisseur's name can't be blank");
      return false;
    } else if (this.player_exists(name)) {
      this.set_error("Connoisseur already exists");
      return false;
    } else {
      return true;
    }
  },
  player_exists: function(name) {
    return Players.findOne({name: name});
  }
};

espresso_price = 0.25
latte_price = 0.35
prepaid_price = 1.0

if (Meteor.isClient) {
  Template.leaderboard.players_active = function () {
      return Players.find({active: { '$mod' : [2,1]}}, {sort: {total: -1, name: 1}});
  };

  Template.leaderboard.players = function () {
      return Players.find( {}, {sort: {total: -1, name: 1}});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.leaderboard.selected_tab = function () {
      var player = Players.findOne(Session.get("selected_player"));
      var tab = (espresso_price * player.etab) + (latte_price * player.ltab) - (prepaid_price * player.ptab);
      return player && tab.toFixed(2);
  };
  
  Template.stats.totalshots = function () {
      var shots = Players.find({});
      var sum = 0;
      shots.forEach(function(Player){
	      sum += Player.total;
	  });
      return sum;
  };

  Template.stats.totalsum = function () {
      var shots = Players.find({});
      var sum = 0;
      shots.forEach(function(Player){
	      sum += (espresso_price * Player.etab) + (latte_price * Player.ltab) - (prepaid_price * Player.ptab);
	  });
      return sum.toFixed(2);
  };

  Template.stats.totalowed = function () {
      var shots = Players.find({});
      var sum = 0;
      shots.forEach(function(Player){
	      sum += Math.max( 0, (espresso_price * Player.etab) + (latte_price * Player.ltab) - (prepaid_price * Player.ptab));
	  });
      return sum.toFixed(2);
  };

  Template.stats.totalprepay = function () {
      var shots = Players.find({});
      var sum = 0;
      shots.forEach(function(Player){
	      sum += (prepaid_price * Player.ptab);
	  });
      return sum.toFixed(2);
  };
  
  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.player_admin.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.player_admin.notactv = function () {
      return ((this.active % 2)==0)  ? "notactv" : '';
  };
  
  Template.newplayer.events = {
      'click input.add': function () {
	  var newplayer = document.getElementById("newplayer").value.trim();
	  if (Validation.valid_name(newplayer)) {
	      Players.insert({name: newplayer, etab: 0, ltab: 0, ptab: 0, total: 0, active: 1});
	  }
      }
  };
  
  Template.newplayer.error = function () {
  	return Session.get("error");
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
                   "Eric",
                   "Matt",
                   "Silvia",
                   "Jon",
                   "Jessica",
									 "Naureen",
									 "Javier",
									 "Peter",
									 "Abhilash",
									 "Jonas"];
      for (var i = 0; i < names.length; i++)
	  Players.insert({name: names[i], etab: 0, ltab: 0, ptab: 0, active: 1, total: 0});
		}

    collectionApi = new CollectionAPI({
      authToken: undefined,              // Require this string to be passed in on each request
      apiPath: 'rest'				             // API path prefix
    });

    // Add the collection Players to the API "/players" path
    collectionApi.addCollection(Players, 'players', {
      methods: ['GET']  // Allow reading
    });

    // Starts the API server
    collectionApi.start();
    });
}
