
var app = angular.module('Twitter', [
  'ngRoute','ngResource'
]);

app.config(["$routeProvider", function ($routeProvider) {
  $routeProvider
    .when("/", {controller: "HomeController", templateUrl: "views/home.html"})
    .when("/profile", {controller: "ProfileController", templateUrl: "views/profile.html"})
}]);

app.run([
  "$http",
  "auth",
  "$rootScope",
  "$location",
  function ($http, auth, $rootScope, $location) {
    var user = auth.getUser();
    if (user) {
      $http.defaults.headers.common['Authorization'] = user.api_token;
    }

    $rootScope.$on(
      "$routeChangeStart",
      function (event, next, current) {
        if (!auth.getUser() && next.controller != "HomeController") {
          $location.path("/");
        }
    });
  }
]);

app.value("config", {
  apiBaseUrl: "http://localhost:4000/api",
  socketBaseUrl: "ws://localhost:4000/socket"
});

app.controller("HomeController", [
  "$scope",
  "usersApi",
  "auth",
  "$location",
  function ($scope, usersApi, auth, $location) {
    $scope.login = function () {
      usersApi.authenticate($scope.auth)
        .then(function success(response) {
          auth.setUser(response.data);
          $location.path("/profile");
        }, function failure(response) {
          $scope.loginError = "Invalid credentials";
        });
    };

    $scope.register = function () {
      usersApi.create($scope.registration)
        .then(function success(response) {
          auth.setUser(response.data);
          $location.path("/profile");
        }, function failure(response) {
          $scope.signupError = "Error creating your account!";
        });
    };
  }
]);

app.controller("ProfileController", [
  "$scope",
  "usersApi",
  "auth",
  "socket",
  "tweetsApi",
  function ($scope, usersApi, auth, socket, tweetsApi) {
    $scope.find = function() {
      /* Get all the listings, then bind it to the scope */
      tweetsApi.getAll()
      .then(function success(response) {
        $scope.listings = response.data["data"];
      }, function(error) {
      });
    };

    $scope.subscribe = function(select_userid, selected_username) {
      /* Get all the listings, then bind it to the scope */
      tweetsApi.subscribe($scope.user, select_userid, selected_username)
      .then(function success(response) {
        console.log(response.data);
      }, function(error) {
      });
    };

    $scope.subscribing = function() {
      /* Get all the listings, then bind it to the scope */
      $scope.slistingers = null;
      tweetsApi.subscribing($scope.user.id)
      .then(function success(response) {
        $scope.slistingings = response.data["data"];
      }, function(error) {
      });
    };

    $scope.retweeted = function() {
      /* Get all the listings, then bind it to the scope */
      tweetsApi.retweeted($scope.user.id)
      .then(function success(response) {
        $scope.listings = response.data["data"];
      }, function(error) {
      });
    };

    $scope.subscriber = function() {
      /* Get all the listings, then bind it to the scope */
      $scope.slistingings = null;
      tweetsApi.subscriber($scope.user.id)
      .then(function success(response) {
        $scope.slistingers = response.data["data"];
      }, function(error) {
      });
    };

    $scope.searchTag = function() {
      tweetsApi.tagSearch($scope.tag)
      .then(function success(response) {
        $scope.listings = response.data["data"];
        console.log(response.data);
      }, function(error) {
      });
    }

    $scope.searchMention = function() {
      tweetsApi.mentionSearch($scope.mention)
      .then(function success(response) {
        $scope.listings = response.data["data"];
        console.log(response.data);
      }, function(error) {
      });
    }

    $scope.retweet = function(tweet_user_id, tweet_id, content) {
      console.log(tweet_user_id);
      console.log($scope.user.id);
      tweetsApi.retweet(tweet_user_id, tweet_id, content, $scope.user.id)
      .then(function success(response) {
        console.log(response.data);
      }, function(error) {
      });
    }

    $scope.user = auth.getUser();
    if ($scope.user) {
      usersApi.get($scope.user.id)
        .then(function success(response) {
          $scope.user = response.data;
        }, function failure(response) {
          $scope.error = "Oops, there was some error retrieving your profile!";
        });

      socket.connect(function (res) {
        console.log("Joined", res)
      })
    }

    $scope.update = function () {
      usersApi.update($scope.user.id, {
        user: $scope.user
      }).then(function success(response) {
        $scope.updated = true;
      }, function failure(response) {
        $scope.error = "Oops, there was some error updating your profile!";
      });
    };

    $scope.release = function () {
      tweetsApi.create($scope.user, $scope.tweet)
        .then(function success(response) {
          $scope.tweet = response.data;
        }, function failure(response) {
          $scope.error = "Oops, there was some error creating tweet!";
        });
    }
  }
]);

app.factory("auth", ["$http", function ($http) {
  return {
    setUser: function (user) {
      localStorage.user = JSON.stringify(user)
      $http.defaults.headers.common['Authorization'] = user.api_token;
    },
    getUser: function () {
      if (localStorage.user != null) {
        return JSON.parse(localStorage.user);
      }

      return null;
    }
  };
}]);

app.factory("socket", ["config", "auth",
  function (config, auth) {
    var socket = null;
    var eventsChannel = null;

    return {
      connect: function (success, failure) {
        user = auth.getUser();

        if (user) {
          socket = new Socket(config.socketBaseUrl, {
            params: {
              token: user.api_token
            }
          });

          socket.connect();

          eventsChannel = socket.channel("events:" + user.id);
          eventsChannel.join()
            .receive("ok", success)
            .receive("error", failure);

        }
      }
    }
  }
]);

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
        return $http.post(config.apiBaseUrl + "/users/authenticate", params);
      },
      get: function (userId) {
        return $http.get(config.apiBaseUrl + "/users/" + userId);
      },
      update: function (userId, updates) {
        console.log(updates);
        return $http.put(config.apiBaseUrl + "/users/" + userId, updates);
      }
   }
}]);

app.factory("tweetsApi", ["$http", "config",
  function ($http, config) {
    return {
      create: function (user, tweet) {
        console.log(user);
        console.log(tweet);
        return $http.post(config.apiBaseUrl + "/tweets/new", { user: user, tweet: tweet });
      },
      getAll: function () {
        return $http.get(config.apiBaseUrl + "/tweets/list");
      },
      subscribe: function (current_user, select_userid, select_username) {
        console.log(select_username);
        return $http.post(config.apiBaseUrl + "/users/follow", { current_user: current_user, select_userid: select_userid, select_username: select_username });
      },
      subscribing: function (userId) {
        console.log(user);
        return $http.get(config.apiBaseUrl + "/follow/" + userId);
      },
      subscriber: function (userId) {
        console.log(user);
        return $http.get(config.apiBaseUrl + "/follower/" + userId);
      },
      tagSearch: function (tag){
        return $http.get(config.apiBaseUrl + "/tag/" + tag);
      },
      mentionSearch: function (mention){
        return $http.get(config.apiBaseUrl + "/mention/" + mention);
      },
      retweet: function (tweet_user_id, tweet_id, content, user_id){
        console.log(tweet_user_id);
        console.log(tweet_id);
        console.log(content);
        console.log(user_id);
        return $http.post(config.apiBaseUrl + "/retweet/new", { tweet_user_id: tweet_user_id, tweet_id: tweet_id, content: content, user_id: user_id });
      },
      retweeted: function (userId){
        return $http.get(config.apiBaseUrl + "/retweet/" + userId);
      }
   }
}]);
