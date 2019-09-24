app.factory("usersApi", ["$http", "config",
  function ($http, config) {
    return {
      all: function () {
        return $http.get(config.apiBaseUrl + "/users")
      },
      create: function (params) {
        return $http.post(config.apiBaseUrl + "/users/new", { user: params });
      },
      authenticate: function (params) {
        console.log(params);
        return $http.post(config.apiBaseUrl + "/users/authenticate", params);
      },
      get: function (userID) {
        console.log(userID);
        debugger;
        return $http.get(config.apiBaseUrl + "/users/" + userID);
      },
      update: function (userId, updates) {
        console.log(updates);
        return $http.put(config.apiBaseUrl + "/users/" + userId, updates);
      }
   }
}]);
