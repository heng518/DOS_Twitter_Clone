
var app = angular.module('Twitter', [
  'ngRoute', 'ngResource'
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
