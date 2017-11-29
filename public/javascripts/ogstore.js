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
        })
        .when('/signup', {
            templateUrl: 'partials/login.html',
            controller: 'LoginCtrl'
        })
        .when('/addproduct', {
            templateUrl: 'partials/addproduct.html'
            //controller:  'AddProductCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

app.controller('HeaderCtrl', ['$scope', '$resource', 'commonservice', 
    function($scope, $resource, commonservice) {        
        $scope.loggedIn = false;
        $scope.isadmin = false;
        $scope.searchField = {
            title: ''
        }       
        $scope.username = '';   
        var User = $resource('/api/authentication');
        User.get({}, function(user) {            
            if(user.user != null && user.user.username != undefined && user.user.username != null && user.user.username != '') {
                $scope.username = user.user.username;
                $scope.loggedIn = true;                               
                $scope.isadmin = user.user.isadmin;
                angular.element(document.querySelectorAll('[selector="productList"]')).scope().isadmin = user.user.isadmin;
                commonservice.setIsAdmin(user.user.isadmin);
                commonservice.setIsLoggedIn(true); 
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


app.controller('HomeCtrl', ['$scope', '$resource', 'commonservice', 
    function($scope, $resource, commonservice){        
        var Products = $resource('/api/products');                
        Products.query(function(products){
            $scope.products = products;  
            if($scope.products != null) {
                angular.forEach($scope.products, function(value, key) {
                    value.myquantity = 1;
                });
        }  
        }); 
        $scope.isadmin = commonservice.getIsAdmin();      
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

app.controller('CategoryCtrl', ['$scope', '$resource', '$routeParams', 'commonservice',
    function($scope, $resource, $routeParams, commonservice){                
        $scope.categories = commonservice.getCategories();
        var Products = $resource('/api/products/categories/:id',{id:'@_id'});        
        Products.query({ id: $routeParams.id }, function(products){
            $scope.products = products;            
        });
}]);


app.controller('ProductCtrl', ['$scope', '$resource', '$location', '$routeParams', 'commonservice', 
    function($scope, $resource, $location, $routeParams, commonservice){
        //$scope.categories = commonservice.getCategories();
        $scope.isadmin = commonservice.getIsAdmin();
        $scope.editproduct = false;
        var Products = $resource('/api/products/:id',{id:'@_id'});        
        Products.get({ id: $routeParams.id }, function(product){
            $scope.product = product;
        });
        $scope.safeDelete = function (product){
            Delete = $resource('/api/products/safedelete');
            Delete.save({productid:product._id}, function(response) {
                if(response.result) {
                    product.safedelete = true;
                }               
            });
        };
        $scope.undoSafeDelete = function (product){
            Add = $resource('/api/products/undosafedelete');
            Add.save({productid:product._id}, function(response) { 
                if(response.result) {
                    product.safedelete = false;
                }               
            });
        };
        $scope.editProduct = function (product) {
            $scope.editproduct = true;
        };
        $scope.saveChanges = function (producttosave) {
            var Product = $resource('/api/products/editproduct');
            Product.save(producttosave, function(response) {
                if(response) {
                    $scope.editproduct = false;          
                }
            });
        };
}]);

app.controller('CartCtrl', ['$scope', '$resource', '$routeParams', 'commonservice', 
    function($scope, $resource, $routeParams, commonservice){
        $scope.categories = commonservice.getCategories();
        var Cart = $resource('/api/products/cart');        
        Cart.query(function(cartitems){
            $scope.cartitems = cartitems;          
        });       
}]);

app.service('commonservice',function()
{
    var _categories;
    function getCategories () {
        return this._categories;
    }
    function setCategories  (categories) {
        this._categories = categories;
    }

    var _isadmin = false;
    function getIsAdmin () {
        return this._isadmin;
    }
    function setIsAdmin (isadmin) {
        this._isadmin = isadmin;
    }

    var _isloggedin = false;
    function getIsLoggedIn () {
        return this._isloggedin;
    }
    function setIsLoggedIn (isloggedin) {
        this._isloggedin = isloggedin;
    }

    return {
        getCategories : getCategories,
        setCategories : setCategories,
        getIsAdmin : getIsAdmin,
        setIsAdmin : setIsAdmin,
        getIsLoggedIn : getIsLoggedIn,
        setIsLoggedIn : setIsLoggedIn
    }
});
