// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players."

Players = new Meteor.Collection("players");

if (Meteor.is_client) {
  Template.leaderboard.players = function () {
    return Players.find({}, {sort: {tab: -1, name: 1}});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
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
			var newplayer = document.getElementById("newplayer").value;
      Players.insert({name: newplayer, tab: 0, total: 0});
		}
	};

  Template.leaderboard.events = {
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {tab: 1, total: 1}});
    },
		'click input.cleartab': function () {
			Players.update(Session.get("selected_player"), {$set: {tab: 0}});
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
        Players.insert({name: names[i], tab: 0, total: 0});
		}
  });
}
