// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players."

import { Template } from 'meteor/templating';
// import { CollectionAPI } from 'meteor/xcv58:collection-api';

Players = new Meteor.Collection("players");
Prices = new Meteor.Collection("prices");


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
      // console.log('check if player exists')
      return Players.findOne({name: name});
    }
  };

  Pricing = {
    prices: function () {
      var prices = {}
      Prices.find({}).forEach(function(price_for_item){
        prices[price_for_item.name] = price_for_item.price
      })
      // var price_banana = Prices.findOne({'name': 'banana'})['price']
      // console.log("insice Pricing")
      // console.log(prices);
      return prices;
    },

    player_tab: function(Player) {
      var prices = Pricing.prices()
      var sum = -prepaid_price * Player.prepaid;
      if (Player.apples)
        sum += prices.apple * Player.apples;
      if (Player.bananas)
        sum += prices.banana * Player.bananas;
      if (Player.kiwis)
        sum += prices.kiwi * Player.kiwis;
      return sum;
    },
  };

  // Templates should use helpers now
  Template.leaderboard.helpers({
    selected_name: function () {
      console.log('Template.leaderboard.helpers selected_name was called');
      var player = Players.findOne(Session.get("selected_player"));
      return player && player.name;
    },

    selected_tab: function () {
      console.log('Template.leaderboard.helpers selected_tab was called');
        var player = Players.findOne(Session.get("selected_player"));
        var tab = Pricing.player_tab(player);
        return player && tab.toFixed(2);
    },

    totalfruit: function () {
      console.log('Template.leaderboard.helpers totalfruit');
      console.log('THIS SEEMS NEVER TO BE CALLED, USED FROM STATS, TO BE DELETED');
      var fruits = Players.find({});
      var sum = 0;
      fruits.forEach(function(Player){
        sum += Player.total;
      });
      return sum;
    },

  });


  Template.Players.helpers({
    players_active: function () {
      console.log('Template.Players.helpers players_active was called');
      return Players.find({active: { '$mod' : [2,1]}}, {sort: {total: -1, name: 1}});
    },

  });

  Template.Admin.helpers({
    players: function () {
      console.log('Template.Admin.helpers players was called');
      return Players.find( {}, {sort: {total: -1, name: 1}});
    },

  });


  Template.stats.helpers({
    totalfruit: function () {
      console.log('Template.stats.helpers totalfruit was called');
      var fruits = Players.find({});
      var sum = 0;
      fruits.forEach(function(Player){
        sum += Player.total;
      });
      return sum;
    },

    totalsum: function () {
      console.log('Template.stats.helpers totalsum');
      console.log('THIS SEEMS NEVER TO BE CALLED, TO BE DELETED');
      var all_players = Players.find({});
      var sum = 0;
      var prices = Pricing.prices();
      all_players.forEach(function(Player){
        sum += Pricing.player_tab(Player)
      });
      return sum.toFixed(2);
    },

    totalowed: function () {
      console.log('Template.stats.helpers totalowed');
      console.log('THIS SEEMS NEVER TO BE CALLED, TO BE DELETED');
      var fruits = Players.find({});
      var sum = 0;
      fruits.forEach(function(Player){
        sum += Math.max( 0, Pricing.player_tab(Player));
      });
      return sum.toFixed(2);
    },

    totalprepay: function () {
      console.log('Template.stats.helpers totalprepay');
      console.log('THIS SEEMS NEVER TO BE CALLED, TO BE DELETED');
      var fruits = Players.find({});
      var sum = 0;
      fruits.forEach(function(Player){
        sum += (prepaid_price * Player.prepaid);
      });
      return sum.toFixed(2);
    },

  });


  Template.player.helpers({
    selected: function () {
      console.log('Template.player.helpers selected was called');
      return Session.equals("selected_player", this._id) ? "selected" : '';
    },

  });

  Template.player_admin.helpers({
    players_active: function () {
      console.log('Template.player_admin.helpers players_active');
      console.log('THIS SEEMS NEVER TO BE CALLED, TO BE DELETED');
      return Players.find({active: { '$mod' : [2,1]}}, {sort: {total: -1, name: 1}});
    },

    players: function () {
      console.log('Template.player_admin.helpers players');
      console.log('THIS SEEMS NEVER TO BE CALLED, TO BE DELETED');
      return Players.find( {}, {sort: {total: -1, name: 1}});
    },


    selected: function () {
      console.log('Template.player_admin.helpers selected was called');
      return Session.equals("selected_player", this._id) ? "selected" : '';
    },

    notactv: function () {
      console.log('Template.player_admin.helpers selected was called');
      return ((this.active % 2)==0)  ? "notactv" : '';
    },

  });

  Template.newplayer.helpers({
    error: function () {
      console.log('Template.newplayer.helpers error was called')
      return Session.get("error");
    },

  });

  Template.newplayer.events = {
    'click input.add': function () {
      var newplayer = document.getElementById("newplayer").value.trim();
      if (Validation.valid_name(newplayer)) {
        Players.insert({name: newplayer, prepaid: 0, total: 0, active: 1});  // TODO: add all the tabs
        Session.set("selected_player", Players.findOne({name: newplayer})["_id"]);
      }
    }
  };

  Template.leaderboard.events = {
    'click input.inc_apple': function () {
      Players.update(Session.get("selected_player"), {$inc: {apples: 1, total: 1}});
    },
    'click input.inc_banana': function () {
      Players.update(Session.get("selected_player"), {$inc: {bananas: 1, total: 1}});
    },
    'click input.inc_kiwi': function () {
      Players.update(Session.get("selected_player"), {$inc: {kiwis: 1, total: 1}});
    },
    'click input.inc_prepaid': function () {
      Players.update(Session.get("selected_player"), {$inc: {prepaid: 1, total: 0}});
    },
    'click input.dec_prepaid': function () {
      Players.update(Session.get("selected_player"), {$inc: {prepaid: -1, total: 0}});
    },
    'click input.cleartab': function () {
      Players.update(Session.get("selected_player"), {$set: {apples: 0, bananas: 0, kiwis: 0, prepaid: 0}});
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
