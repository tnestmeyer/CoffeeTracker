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
      return prices
    }
  };

  // Templates should use helpers now
  Template.leaderboard.helpers({

    selected_name: function () {
      var player = Players.findOne(Session.get("selected_player"));
      return player && player.name;
    },

    selected_tab: function () {
        var player = Players.findOne(Session.get("selected_player"));
        var tab = (espresso_price * player.etab) + (latte_price * player.ltab) - (prepaid_price * player.prepaid);
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


  Template.Players.helpers({

    players_active: function () {
        // console.log('with helper');
        return Players.find({active: { '$mod' : [2,1]}}, {sort: {total: -1, name: 1}});
    },

  });

  Template.Admin.helpers({

    players: function () {
      console.log('Template.Admin.helpers players')
      return Players.find( {}, {sort: {total: -1, name: 1}});
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
        var prices = Pricing.prices()
        fruits.forEach(function(Player){
          sum += prices.apple * Player.apples;
          sum += prices.banana * Player.bananas;
          sum += prices.kiwi * Player.kiwis;
          sum -= prepaid_price * Player.prepaid;
        });
        return sum.toFixed(2);
    },

    totalowed: function () {
        var fruits = Players.find({});
        var sum = 0;
        fruits.forEach(function(Player){
          sum += Math.max( 0, (espresso_price * Player.etab) + (latte_price * Player.ltab) - (prepaid_price * Player.prepaid));
        });
        return sum.toFixed(2);
    },

    totalprepay: function () {
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
      console.log('Template.player.helpers selected');
      return Session.equals("selected_player", this._id) ? "selected" : '';
    },

  });

  Template.player_admin.helpers({
    players_active: function () {
      console.log('Template.player_admin.helpers players_active');
      return Players.find({active: { '$mod' : [2,1]}}, {sort: {total: -1, name: 1}});
    },

    players: function () {
      console.log('Template.player_admin.helpers players');
      return Players.find( {}, {sort: {total: -1, name: 1}});
    },


    selected: function () {
      console.log('Template.player_admin.helpers selected');
      return Session.equals("selected_player", this._id) ? "selected" : '';
    },

    notactv: function () {
      console.log('Template.player_admin.helpers selected');
      return ((this.active % 2)==0)  ? "notactv" : '';
    },

  });

  Template.newplayer.helpers({
    error: function () {
      return Session.get("error");
    },

  });

  Template.newplayer.events = {
      'click input.add': function () {
        var newplayer = document.getElementById("newplayer").value.trim();
        if (Validation.valid_name(newplayer)) {
          Players.insert({name: newplayer, etab: 0, ltab: 0, prepaid: 0, total: 0, active: 1});  // TODO: add all the tabs
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
        Players.update(Session.get("selected_player"), {$set: {ltab: 0, etab: 0, prepaid: 0}});
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
