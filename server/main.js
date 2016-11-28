Meteor.startup(function () {
  if (Fruits.find().count() === 0) {
    Fruits.insert({name: 'Apple', price: 0.50, active: true, eaten: 0});
    Fruits.insert({name: 'Apricot', price: 0.50, active: true, eaten: 0});
    Fruits.insert({name: 'Banana', price: 0.65, active: true, eaten: 0});
    Fruits.insert({name: 'Kiwi', price: 0.75, active: true, eaten: 0});
    Fruits.insert({name: 'Nectarine', price: 0.90, active: true, eaten: 0});
    Fruits.insert({name: 'Peach', price: 0.90, active: true, eaten: 0});
  };

  if (Players.find().count() === 0) {
    var names = ["Naureen",
                 "Laura",
                 "Jonas",
                 "Sergi",
                 "Peter",
                 "Hedvig",
                 "Sergey",
                 "Thomas N.",
                 "Fatma",
                 "Anurag",
                 "Osman",
                 "Gerard",
               ];


    for (var i = 0; i < names.length; i++) {

      // add the main entries
      var player_entry = {name: names[i], prepaid: 0, tab: 0, active: 1, total: 0};

      // add the fruit counts
      var all_fruits = Fruits.find({});
      all_fruits.forEach(function(fruit_item){
        player_entry[fruit_item.name] = 0;
      });

      // finally add the entry to the DB
      Players.insert(player_entry);
    };
  };
});
