app.factory("tweetsApi", ["$http", "config",
  function ($http, config) {
    return {
      create: function (user, tweet) {
        return $http.post(config.apiBaseUrl + "/tweets/new", { user: user, tweet: tweet });
      }
      getAll: function () {
        return $http.get(config.apiBaseUrl + "/tweets/list");
      },
      subscribe: function (current_user, select_userid, select_username) {
        return $http.post(config.apiBaseUrl + "/users/follow", { current_user: current_user, select_userid: select_userid, select_username: select_username });
      },
      subscribing: function (user) {
        return $http.get(config.apiBaseUrl + "/following", { user: user});
      }
   }
}]);
