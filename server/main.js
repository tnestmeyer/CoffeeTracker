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
        {name: names[i], active: 1, total: 0}  // TODO: add all the open tabs
      );
  };

  if (Prices.find().count() === 0) {
    Prices.insert({name: 'apple', price: 0.50});
    Prices.insert({name: 'banana', price: 0.45});
    Prices.insert({name: 'kiwi', price: 0.60});
  }

// collectionAPI seems not to be needed?!

  // collectionApi = new CollectionAPI({
  //   authToken: undefined,              // Require this string to be passed in on each request
  //   apiPath: 'rest'                    // API path prefix
  // });
  //
  // // Add the collection Players to the API "/players" path
  // collectionApi.addCollection(Players, 'players', {
  //   methods: ['GET']  // Allow reading
  // });
  //
  // // Starts the API server
  // collectionApi.start();


  });
