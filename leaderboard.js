// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players."

import { Template } from 'meteor/templating';
// import { CollectionAPI } from 'meteor/xcv58:collection-api';

Players = new Meteor.Collection("players");
Fruits = new Meteor.Collection("fruits");
Logs = new Meteor.Collection("logs");


Router.configure({
 	layoutTemplate: 'ApplicationLayout',
	    templateNameConverter: 'upperCamelCase'
 	    });

Router.map(function() {
	this.route('players', {path: '/'  });
	this.route('admin', {template: 'Admin',  path: '/admin1100101AccessPage'  });
    });



prepaid_price = 1.0;

formatted_price = function (price) {
  return price.toFixed(2);
};


if (Meteor.isClient) {

  Validation = {
    clear_error_player: function () {
      return Session.set("error_player", undefined);
    },
    set_error_player: function (message) {
      return Session.set("error_player", message);
    },
    valid_name: function (name) {
      this.clear_error_player();
      if (name.length == 0) {
        this.set_error_player("Warning! A person's name can't be blank!");
        return false;
      } else if (this.player_exists(name)) {
        this.set_error_player("Warning! This person already exists!");
        return false;
      } else {
        return true;
      }
    },
    player_exists: function(name) {
      // console.log('check if player exists')
      return Players.findOne({name: name});
    },

    clear_error_fruit: function () {
      return Session.set("error_fruit", undefined);
    },
    set_error_fruit: function (message) {
      return Session.set("error_fruit", message);
    },
    valid_fruit_name: function (name) {
      this.clear_error_fruit();
      if (name.length == 0) {
        this.set_error_fruit("Fruit name can't be blank");
        return false;
      } else if (this.fruit_exists(name)) {
        this.set_error_fruit("Fruit already exists");
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
      this.clear_error_fruit();
      if (price.length == 0) {
        this.set_error_fruit("Price can't be blank");
        return false;
      } else {
        if (!isFinite(parseFloat(price))) {
          this.set_error_fruit("Price is not a number (did you mix up the boxes? left: price, right: fruit)");
          return false;
        } else {
          return true;
        }
      }
    },
  };

  Pricing = {
    player_tab: function(Player) {
      // var sum = -prepaid_price * Player.prepaid;
      // Fruits.find({}).forEach(function(fruit_item){
      //   amount = Player[fruit_item.name];
      //   if (amount)
      //     sum += fruit_item.price * amount;
      //   // sum += fruit_item.price * amount;
      // })
      // return sum;
      return Player.tab;
    },

    current_week: function() {
      var sum = 0;
      Fruits.find({}).forEach(function(fruit_item){
        amount = fruit_item['eaten'];
        if (amount)
          sum += fruit_item['price'] * amount;
      })
      // return sum;
      return formatted_price(sum);
    },
  };

  // helpers (Templates should use helpers now)
  Template.leaderboard.helpers({
    selected_name: function () {
      // console.log('Template.leaderboard.helpers selected_name was called');
      var player = Players.findOne(Session.get("selected_player"));
      if (player && player["tab"] > 10) {
        Validation.set_error_player("Please go to Thomas and give him money!");
      }
      else {
        Validation.clear_error_player();
      }
      return player && player.name;
    },

    selected_tab: function () {
      // console.log('Template.leaderboard.helpers selected_tab was called');
      var player = Players.findOne(Session.get("selected_player"));
      var tab = Pricing.player_tab(player);
      // return player && tab.toFixed(2);
      return player && formatted_price(tab);
    },

  });


  Template.Players.helpers({
    players_active: function () {
      // console.log('Template.Players.helpers players_active was called');
      return Players.find({active: { '$mod' : [2,1]}}, {sort: {total: -1, tab: 1, name: 1}});
    },

    fruits_active: function () {
      // console.log('Template.Players.helpers fruits_active was called');
      return Fruits.find({active: true}, {sort: {name: 1}});
    },

  });

  Template.Admin.helpers({
    players: function () {
      // console.log('Template.Admin.helpers players was called');
      return Players.find( {}, {sort: {tab: -1, total: -1, name: 1}});
    },

    fruits: function () {
      // console.log('Template.Admin.helpers fruits was called');
      return Fruits.find({}, {sort: {name: 1}});
    },

    totalowed: function () {
      // console.log('Template.Admin.helpers totalowed');
      var all_players = Players.find({});
      var sum = 0;
      all_players.forEach(function(Player){
        sum += Pricing.player_tab(Player)
      });
      // return sum.toFixed(2);
      return formatted_price(sum);
    },

    totalprepay: function () {
      // console.log('Template.Admin.helpers totalprepay');
      var all_players = Players.find({});
      var sum = 0;
      all_players.forEach(function(Player){
        sum += (prepaid_price * Player.prepaid);
      });
      // return sum.toFixed(2);
      return formatted_price(sum);
    },

    totalsum: function () {
      // console.log('Template.Admin.helpers totalsum');
      var all_players = Players.find({});
      var sum = 0;
      all_players.forEach(function(Player){
        sum += Pricing.player_tab(Player)
        sum += (prepaid_price * Player.prepaid);
      });
      // return sum.toFixed(2);
      return formatted_price(sum);
    },

    currentweek: function () {
      // console.log('Template.Admin.helpers currentweek');
      return Pricing.current_week();
    },

    selected_tab: function () {
      // console.log('Template.Admin.helpers selected_tab was called');
      var player = Players.findOne(Session.get("selected_player"));
      var tab = Pricing.player_tab(player);
      // return player && tab.toFixed(2);
      return player && formatted_price(tab);
    },

    full_db_state: function() {
      // console.log(Fruits.find({}));
      // console.log(Players.find({}));
      var out = "\n";

      out += "\nFruits = [\n";
      var all_fruits = Fruits.find({});
      all_fruits.forEach(function(Fruit){
        out += JSON.stringify(Fruit) + ",\n";
      });
      out += "];\n"

      out += "\nPlayers = [\n";

      var all_players = Players.find({});
      all_players.forEach(function(Player){
        out += JSON.stringify(Player) + ",\n";
      });
      out += "];\n"

      out += "\nLogs = [\n";


      var limit = 50
      var options = {
          "limit": limit,
          "skip": Logs.find({}).count() - limit,
          // "sort": "_id"
      }
      var all_logs = Logs.find({}, options);  // only show part of it!
      all_logs.forEach(function(Log){
        out += JSON.stringify(Log) + ",\n";
      });
      out += "];\n"

      return out;
    }

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

    formatted_price: function (price) {
      // console.log('Template.fruit.helpers formatted_price was called');
      // return price.toFixed(2);
      return formatted_price(price);
    },

  });

  Template.newplayer.helpers({
    error: function () {
      // console.log('Template.newplayer.helpers error was called')
      return Session.get("error_player");
    },

  });

  // events
  Template.newplayer.events = {
    'click input.add': function () {
      var newplayer = document.getElementById("newplayer").value.trim();
      if (Validation.valid_name(newplayer)) {
        // set the main fields
        var entry = {name: newplayer, prepaid: 0, tab: 0, total: 0, active: 1};
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
      var fruit_item = event['target'].value.split(" ")[0];
      var chosen_fruit = Fruits.findOne({'name': fruit_item})
      // console.log('inc_fruit called with')
      // console.log(fruit_item)

      // does not work like the following since it assumes fruit_item to be the name, not the content of the variable
      // Players.update(Session.get("selected_player"), {$inc: {fruit_item: 1, total: 1}});

      // but works by explicitly creating the dictionary
      dict = {"total": 1, "tab": chosen_fruit['price']}
      dict[fruit_item] = 1
      // console.log(dict)
      Players.update(Session.get("selected_player"), {$inc: dict});
      Fruits.update(chosen_fruit["_id"], {$inc: {'eaten': 1}});

      // log the acitivity
      var date = new Date()  // get current date/time
      // console.log(date.toString())
      // console.log(date.toJSON())
      // console.log(date.toLocaleString())
      Logs.insert({'player': Players.findOne({'_id': Session.get("selected_player")})['name'], 'fruit': chosen_fruit['name'], 'price': chosen_fruit['price'], 'data': date.toLocaleString()});

      // unselect the current player to avoid someone adding his/her fruit to the last user
      Session.set("selected_player", undefined);
    },

    'click input.dec_prepaid_val1': function () {
      Players.update(Session.get("selected_player"), {$inc: {prepaid: -1, tab: 1}});
    },
    'click input.inc_prepaid_val1': function () {
      Players.update(Session.get("selected_player"), {$inc: {prepaid: 1, tab: -1}});
    },
    'click input.dec_prepaid_val2': function () {
      Players.update(Session.get("selected_player"), {$inc: {prepaid: -5, tab: 5}});
    },
    'click input.inc_prepaid_val2': function () {
      Players.update(Session.get("selected_player"), {$inc: {prepaid: 5, tab: -5}});
    },
    'click input.dec_prepaid_val3': function () {
      Players.update(Session.get("selected_player"), {$inc: {prepaid: -0.05, tab: 0.05}});
    },
    'click input.inc_prepaid_val3': function () {
      Players.update(Session.get("selected_player"), {$inc: {prepaid: 0.05, tab: -0.05}});
    },
    'click input.inc_total': function () {
      Players.update(Session.get("selected_player"), {$inc: {total: 1}});
    },
    'click input.dec_total': function () {
      Players.update(Session.get("selected_player"), {$inc: {total: -1}});
    },
    'click input.dec_tab': function () {
      Players.update(Session.get("selected_player"), {$inc: {tab: -0.05}});
    },
    'click input.cleartab': function (event) {
      // console.log('clear tab called')
      var change_entry = {};
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
      // return price.toFixed(2);
      return formatted_price(price);
    },

  });

  Template.change_fruit_price.helpers({
    formatted_price: function (price) {
      // console.log('Template.change_fruit_price.helpers formatted_price was called');
      // return price.toFixed(2);
      return formatted_price(price);
    },

    error: function () {
      // console.log('Template.change_fruit_price.helpers error was called')
      return Session.get("error_fruit");
    },

    active: function (fruit_item) {
      // console.log('Template.change_fruit_price.helpers active was called')
      return Fruits.findOne({'name': fruit_item})['active'];
    },
  });

  Template.change_fruit_price.events({
    'click input.change_fruit_price_button': function (event) {
      // console.log('Template.change_fruit_price.events click input.change_fruit_price_button called')
      var fruit_item = event['target'].value.split(" ")[3];
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

    'click input.remove_fruit_button': function (event) {
      // console.log('Template.change_fruit_price.events click input.remove_fruit_button called')
      var fruit_item = event['target'].value.split(" ")[1];
      // console.log(event)
      // console.log(fruit_item)
      // get the fruit price and show a message, so you can easily add the fruit again when accidentally removing it
      var fruit_price = Fruits.findOne({'name': fruit_item})['price']
      Validation.set_error_fruit("Removed fruit " + fruit_item + " with price " + fruit_price)

      // now remove the fruit:
      var id = Fruits.findOne({'name': fruit_item})['_id']
      // console.log(id)
      Fruits.remove(id);
    },

    'click input.toggle_active_fruit_button': function (event) {
      // console.log('Template.change_fruit_price.events click input.toggle_active_fruit_button called')
      var fruit_item = event['target'].value.split(" ")[2];
      var id = Fruits.findOne({'name': fruit_item})['_id'];
      var active = Fruits.findOne({'name': fruit_item})['active'];
      // console.log(id)
      if (active) {
        // console.log("was active")
        event['target'].style.color = 'red'
        Fruits.update(id, {$set: {'active': false}});
      } else {
        event['target'].style.color = 'green'
        Fruits.update(id, {$set: {'active': true}});
      }
    },
  })

  Template.new_fruit.helpers({
    error: function () {
      // console.log('Template.new_fruit.helpers error was called')
      return Session.get("error_fruit");
    },

  });

  Template.new_fruit.events({
    'click input.new_fruit_button': function (event) {
      // console.log('Template.new_fruit.events click input.new_fruit_button called')
      var name = document.getElementById("new_fruit_name").value.trim();
      var price = document.getElementById("new_fruit_price").value;
      // console.log(event)
      // console.log(fruit_item)
      // console.log(price)
      if (Validation.valid_fruit_name(name)) {
        if (Validation.valid_fruit_price(price)) {
          Fruits.insert({'name': name, 'price': parseFloat(price), 'active': true});
        }
      }
    },

    'click input.clear_eaten_button': function (event) {
      // console.log('Template.new_fruit.events click input.clear_eaten_button called')
      var all_fruits = Fruits.find({});
      all_fruits.forEach(function(fruit_item){
        // console.log(fruit_item)
        var id = Fruits.findOne({'name': fruit_item['name']})['_id'];
        Fruits.update(id, {$set: {'eaten': 0}});
      });      
    },

  })

}
