var app = angular.module('ogstore', ['ngResource', 'ngRoute']);



app.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'partials/home.html',
            controller : 'HomeCtrl'
        })
        .when('/category/:id', {         
            templateUrl: 'partials/home.html',
            controller : 'CategoryCtrl'
        })
        .when('/product/:id', {        	
        	templateUrl: 'partials/single.html',
        	controller : 'ProductCtrl'
    	})
        .otherwise({
            redirectTo: '/'
        });
}]);


app.controller('HomeCtrl', ['$scope', '$resource', 'categoryservice', 
    function($scope, $resource, categoryservice){
        var Products = $resource('/api/products');
        Products.query(function(products){
            $scope.products = products;            
        });
        
        var Categories = $resource('/api/products/categories');
        Categories.query(function(categories){
            categoryservice.setCategories(categories);
            $scope.categories = categories;
        });
}]);

app.controller('CategoryCtrl', ['$scope', '$resource', '$routeParams', 'categoryservice',
    function($scope, $resource, $routeParams, categoryservice){                
        $scope.categories = categoryservice.getCategories();
        var Products = $resource('/api/products/categories/:id',{id:'@_id'});        
        Products.query({ id: $routeParams.id }, function(products){
            $scope.products = products;
        });
}]);


app.controller('ProductCtrl', ['$scope', '$resource', '$location', '$routeParams', 'categoryservice', 
    function($scope, $resource, $location, $routeParams, categoryservice){
        $scope.categories = categoryservice.getCategories();
        var Products = $resource('/api/products/:id',{id:'@_id'});        
        Products.get({ id: $routeParams.id }, function(product){
            $scope.product = product;
        });
}]);


app.service('categoryservice',function()
{
    var _categories;
    function getCategories () {
        return this._categories;
    }
    function setCategories  (categories) {
        this._categories = categories;
    }
    return {
        getCategories     : getCategories,
        setCategories     : setCategories
    }
});