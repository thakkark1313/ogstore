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
        .when('/cart', {         
            templateUrl: 'partials/checkout.html',
            controller : 'CartCtrl'
        })        
        .when('/login', {
            templateUrl: 'partials/login.html',            
            controller: 'LoginCtrl'
        }).
        when('/signup', {
<<<<<<< HEAD
            templateUrl: 'partials/login.html'
=======
            templateUrl: 'partials/Login.html',
            controller: 'LoginCtrl'
>>>>>>> 75407463f1dc236001bd90985474665ece1d021a
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

app.controller('HeaderCtrl', ['$scope', '$resource', 
    function($scope, $resource) {        
        $scope.loggedIn = false;
        $scope.searchField = {
            title: ''
        }       
        $scope.username = '';   
        var User = $resource('/api/authentication');
        User.get({}, function(user) {
            debugger;
            if(user.user != null && user.user.username != undefined && user.user.username != null && user.user.username != '') {
                $scope.username = user.user.username;
                $scope.loggedIn = true;
            }
        });        
        $scope.$watch('searchField.title', function(newValue, oldValue) {
            var productListScope = angular.element(document.querySelectorAll('[selector="productList"]')).scope();
            if(productListScope != undefined)            
                productListScope.searchField.title = newValue;
        });
        $scope.loginMouseOver = function () {
            $(".dropdown").hover(            
                function() {
                    $('.dropdown-menu', this).stop( true, true ).slideDown("fast");
                    $(this).toggleClass('open');        
                },
                function() {
                    $('.dropdown-menu', this).stop( true, true ).slideUp("fast");
                    $(this).toggleClass('open');       
                }
            );
        };    
}]);

app.controller('LoginCtrl', ['$scope', '$resource', '$location', '$http',
    function($scope, $resource, $location, $http) {
        $scope.isSignup = false; 
        $scope.lblLoginSignup = 'Sign Up';       
        $scope.loginSignupToggle = function(element) {
            if(element.target.nodeName == "DIV") 
                $(element.target).parent().children('i').toggleClass('fa-pencil');
            else if(element.target.nodeName == "I")
                $(element.target).toggleClass('fa-pencil')
            if($scope.isSignup) {
                $scope.lblLoginSignup = 'Sign Up';
                $scope.isSignup = false;                
            }
            else {
                $scope.lblLoginSignup = 'Login';
                $scope.isSignup = true;                                            
            }
        };
        if($location.path() == '/signup') {
            var elm = {target:{nodeName: 'DIV'}};
            $scope.loginSignupToggle(elm);
        };       
}]);

app.controller('LeftBannerCtrl', ['$scope', '$resource', 
    function($scope, $resource) {
        var Categories = $resource('/api/products/categories');
        Categories.query(function(categories){            
            $scope.categories = categories;
        });
}]);


app.controller('HomeCtrl', ['$scope', '$resource', 'categoryservice', 
    function($scope, $resource, categoryservice){
        var Products = $resource('/api/products');        
        Products.query(function(products){
            $scope.products = products;  
            if($scope.products != null) {
                angular.forEach($scope.products, function(value, key) {
                    value.myquantity = 1;
                });
        }  
        }); 
      
        $scope.searchField = {
            title: ''
        }           
        $scope.addtocart = function (product)
        {          
            Products = $resource('/api/products/addtocart');
            Products.save({pid:product._id, qty:product.myquantity}, function() {

            });                        
        };
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

app.controller('CartCtrl', ['$scope', '$resource', '$routeParams', 'categoryservice', 
    function($scope, $resource, $routeParams, categoryservice){
        $scope.categories = categoryservice.getCategories();
        var Cart = $resource('/api/products/cart');        
        Cart.query(function(cartitems){
            $scope.cartitems = cartitems;          
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
        getCategories : getCategories,
        setCategories : setCategories
    }
});
