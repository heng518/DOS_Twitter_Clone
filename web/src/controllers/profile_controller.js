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
      tweetsApi.subscribing($scope.user)
      .then(function success(response) {
        $scope.slistings = response.data["data"];
        console.log(response.data);
      }, function(error) {
      });
    };

    $scope.searchTag() = function() {
      tweetsApi.tagSearch($scope.tag)
      .then(function success(response) {
        $scope.tlistings = response.data["data"];
        console.log(response.data);
      }, function(error) {
      });
    }

    $scope.searchMention() = function() {
      tweetsApi.mentionSearch($scope.mention)
      .then(function success(response) {
        $scope.tlistings = response.data["data"];
        console.log(response.data);
      }, function(error) {
      });
    }

    $scope.user = auth.getUser();

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
