// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players."

import { Template } from 'meteor/templating';
// import { CollectionAPI } from 'meteor/xcv58:collection-api';

Players = new Meteor.Collection("players");
Fruits = new Meteor.Collection("fruits");


Router.configure({
 	layoutTemplate: 'ApplicationLayout',
	    templateNameConverter: 'upperCamelCase'
 	    });

Router.map(function() {
	this.route('players', {path: '/'  });
	this.route('admin', {template: 'Admin',  path: '/admin'  });
    });



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
    },

    valid_fruit_name: function (name) {
      this.clear();
      if (name.length == 0) {
        this.set_error("Fruit name can't be blank");
        return false;
      } else if (this.fruit_exists(name)) {
        this.set_error("Fruit already exists");
        return false;
      } else {
        return true;
      }
    },
    fruit_exists: function(name) {
      // console.log('check if fruit exists')
      return Fruits.findOne({name: name});
    },
    valid_fruit_price: function (price) {
      this.clear();
      if (price.length == 0) {
        this.set_error("Price can't be blank");
        return false;
      } else {
        return true;
      }
    },
  };

  Pricing = {
    player_tab: function(Player) {
      var sum = -prepaid_price * Player.prepaid;
      Fruits.find({}).forEach(function(fruit_item){
        amount = Player[fruit_item.name];
        if (amount)
          sum += fruit_item.price * amount;
        // sum += fruit_item.price * amount;
      })
      return sum;
    },
  };

  // helpers (Templates should use helpers now)
  Template.leaderboard.helpers({
    selected_name: function () {
      // console.log('Template.leaderboard.helpers selected_name was called');
      var player = Players.findOne(Session.get("selected_player"));
      return player && player.name;
    },

    selected_tab: function () {
      // console.log('Template.leaderboard.helpers selected_tab was called');
      var player = Players.findOne(Session.get("selected_player"));
      var tab = Pricing.player_tab(player);
      return player && tab.toFixed(2);
    },

  });


  Template.Players.helpers({
    players_active: function () {
      // console.log('Template.Players.helpers players_active was called');
      return Players.find({active: { '$mod' : [2,1]}}, {sort: {total: -1, name: 1}});
    },

    fruits: function () {
      // console.log('Template.Players.helpers fruits was called');
      return Fruits.find();
    },

  });

  Template.Admin.helpers({
    players: function () {
      // console.log('Template.Admin.helpers players was called');
      return Players.find( {}, {sort: {total: -1, name: 1}});
    },

    fruits: function () {
      // console.log('Template.Admin.helpers fruits was called');
      return Fruits.find({});
    },

    totalsum: function () {
      // console.log('Template.Admin.helpers totalsum');
      var all_players = Players.find({});
      var sum = 0;
      all_players.forEach(function(Player){
        sum += Pricing.player_tab(Player)
      });
      return sum.toFixed(2);
    },

    totalprepay: function () {
      // console.log('Template.Admin.helpers totalprepay');
      var all_players = Players.find({});
      var sum = 0;
      all_players.forEach(function(Player){
        sum += (prepaid_price * Player.prepaid);
      });
      return sum.toFixed(2);
    },

    totalowed: function () {
      // console.log('Template.Admin.helpers totalowed');
      var all_players = Players.find({});
      var sum = 0;
      all_players.forEach(function(Player){
        sum += Math.max( 0, Pricing.player_tab(Player));
      });
      return sum.toFixed(2);
    },

    fruit_prices: function () {
      // console.log('Template.Admin.helpers fruit_prices');
      var all_fruits = Fruits.find({});
      var s = "";
      all_fruits.forEach(function(fruit_item){
        s += fruit_item.name + " " + fruit_item.price + "   ";
      });
      return s;
    },

  });


  Template.stats.helpers({
    totalfruit: function () {
      // console.log('Template.stats.helpers totalfruit was called');
      var all_players = Players.find({});
      var sum = 0;
      all_players.forEach(function(Player){
        sum += Player.total;
      });
      return sum;
    },

  });


  Template.player.helpers({
    selected: function () {
      // console.log('Template.player.helpers selected was called');
      return Session.equals("selected_player", this._id) ? "selected" : '';
    },

  });

  Template.player_admin.helpers({

    selected: function () {
      // console.log('Template.player_admin.helpers selected was called');
      return Session.equals("selected_player", this._id) ? "selected" : '';
    },

    notactv: function () {
      // console.log('Template.player_admin.helpers notactv was called');
      return ((this.active % 2)==0)  ? "notactv" : '';
    },

  });

  Template.newplayer.helpers({
    error: function () {
      // console.log('Template.newplayer.helpers error was called')
      return Session.get("error");
    },

  });

  // events
  Template.newplayer.events = {
    'click input.add': function () {
      var newplayer = document.getElementById("newplayer").value.trim();
      if (Validation.valid_name(newplayer)) {
        // set the main fields
        var entry = {name: newplayer, prepaid: 0, total: 0, active: 1};
        // set all fruits to 0
        var all_fruits = Fruits.find({});
        all_fruits.forEach(function(fruit_item){
          entry[fruit_item.name] = 0;
        });
        Players.insert(entry);
        // choose the newly added person as the selected player
        Session.set("selected_player", Players.findOne({name: newplayer})["_id"]);
      }
    }
  };

  Template.leaderboard.events = {
    'click input.inc_fruit': function (event) {
      var fruit_item = event['target'].value.split(" ")[0]
      // console.log('inc_fruit called with')
      // console.log(fruit_item)

      // does not work like the following since it assumes fruit_item to be the name, not the content of the variable
      // Players.update(Session.get("selected_player"), {$inc: {fruit_item: 1, total: 1}});

      // but works by explicitly creating the dictionary
      dict = {"total": 1}
      dict[fruit_item] = 1
      // console.log(dict)
      Players.update(Session.get("selected_player"), {$inc: dict});
    },

    'click input.inc_prepaid_val1': function () {
      Players.update(Session.get("selected_player"), {$inc: {prepaid: 1, total: 0}});
    },
    'click input.dec_prepaid_val1': function () {
      Players.update(Session.get("selected_player"), {$inc: {prepaid: -1, total: 0}});
    },
    'click input.inc_prepaid_val2': function () {
      Players.update(Session.get("selected_player"), {$inc: {prepaid: 5, total: 0}});
    },
    'click input.dec_prepaid_val2': function () {
      Players.update(Session.get("selected_player"), {$inc: {prepaid: -5, total: 0}});
    },
    'click input.cleartab': function () {
      // console.log('clear tab called')
      var change_entry = {prepaid: 0};
      // set all fruits to 0
      var all_fruits = Fruits.find({});
      all_fruits.forEach(function(fruit_item){
        change_entry[fruit_item.name] = 0;
      });
      // update the entry
      Players.update(Session.get("selected_player"), {$set: change_entry});
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

  Template.fruit.helpers({
    formatted_price: function (price) {
      // console.log('Template.fruit.helpers formatted_price was called');
      return price.toFixed(2);
    },

  });

  Template.change_fruit_price.events({
    'click input.change_fruit_price_button': function (event) {
      console.log('Template.change_fruit_price.events click input.change_fruit_price_button called')
      var fruit_item = event['target'].value.split(" ")[3]
      var price = document.getElementById("new_fruit_price").value;
      // console.log(event)
      // console.log(fruit_item)
      // console.log(price)

      var id = Fruits.findOne({'name': fruit_item})['_id']
      // console.log(id)
      if (Validation.valid_fruit_price(price)) {
        Fruits.update(id, {$set: {'price': parseFloat(price)}});
      }
    },
  })

  Template.new_fruit.events({
    'click input.new_fruit_button': function (event) {
      console.log('Template.new_fruit.events click input.new_fruit_button called')
      var name = document.getElementById("new_fruit_name").value.trim();
      var price = document.getElementById("new_fruit_price").value;
      // console.log(event)
      // console.log(fruit_item)
      // console.log(price)
      if (Validation.valid_fruit_name(name)) {
        if (Validation.valid_fruit_price(price)) {
          Fruits.insert({'name': name, 'price': parseFloat(price)});
        }
      }
    },
  })

}
