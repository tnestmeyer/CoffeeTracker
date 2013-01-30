// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players."

Players = new Meteor.Collection("players");

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

if (Meteor.isClient) {
  Template.leaderboard.players = function () {
    return Players.find({}, {sort: {total: -1, name: 1}});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

	Template.leaderboard.selected_tab = function () {
		var player = Players.findOne(Session.get("selected_player"));
		var tab = (espresso_price * player.etab) + (latte_price * player.ltab);
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

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

	Template.newplayer.events = {
		'click input.add': function () {
			var newplayer = document.getElementById("newplayer").value.trim();
			if (Validation.valid_name(newplayer)) {
      	Players.insert({name: newplayer, etab: 0, ltab: 0, total: 0});
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
		'click input.cleartab': function () {
			Players.update(Session.get("selected_player"), {$set: {ltab: 0, etab: 0}});
  	}
  };

  Template.player.events = {
    'click': function () {
      Session.set("selected_player", this._id);
    }
  };
}

// On server startup, create some players if the database is empty.
if (Meteor.is_server) {
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
        Players.insert({name: names[i], etab: 0, ltab: 0, total: 0});
		}
  });
}
