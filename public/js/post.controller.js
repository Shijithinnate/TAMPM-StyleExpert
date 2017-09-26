angular.module('soYouApp', [])
.controller('PostController', ['$scope', function ($scope) {
    console.log("initialized controller")
    $scope.post = postObj;
    $scope.serverURLs = serverURLs;
    //$scope.greetMe = 'World';
}]);
angular.element(function() {
    angular.bootstrap(document, ['soYouApp']);
});