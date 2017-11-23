var app = angular.module('ogstore', ['ngResource', 'ngRoute']);



app.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'partials/home.html',
            controller : 'HomeCtrl'
        })
        .when('/product/:id', {        	
        	templateUrl: 'partials/single.html',
        	controller : 'ProductCtrl'
    	})
        .otherwise({
            redirectTo: '/'
        });
}]);


app.controller('HomeCtrl', ['$scope', '$resource', 
    function($scope, $resource){
        var Products = $resource('/api/products');
        Products.query(function(products){
            $scope.products = products;            
        });
        /*
        var Categories = $resource('/api/categories');
        Categories.query(function(categories){
            $scope.categories = categories;
        });*/
}]);

app.controller('ProductCtrl', ['$scope', '$resource', '$location', '$routeParams', 
    function($scope, $resource, $location, $routeParams){
        var Products = $resource('/api/products/:id',{id:'@_id'});
        console.log(Products);
        Products.get({ id: $routeParams.id }, function(product){
            $scope.product = product;
        });
}]);