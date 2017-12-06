var app = angular.module('ogstore', ['ngResource', 'ngRoute', 'ngFileUpload']);

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
            templateUrl: 'partials/addproduct.html',
            controller:  'AddProductCtrl'
        })
        .when('/checkout',{
            templateUrl: 'partials/payment.html',
            controller : 'CheckoutCtrl'
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
                try {
                    angular.element(document.querySelectorAll('[selector="productList"]')).scope().isadmin = user.user.isadmin;
                }                
                catch(e) {}
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
        $scope.userexistsmessage = false;
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
        $scope.validateUserName = function(){
            $scope.userexistsmessage = false;
            var reg = /^\w+$/;
            if(!reg.test($('[name="username"]').val())) {
                $scope.usernamemessagetxt = 'Username can only contain letters, numbers and underscores';
                $scope.userexistsmessage = true;
                signupform.username.focus();
            }
            else {
                var User = $resource('/api/authentication/userexists');
                User.save({username:$('[name="username"]').val()}, function(response) {
                    if(response.result) {
                        $scope.usernamemessagetxt = 'Username already exists';
                        $scope.userexistsmessage = true;
                        signupform.username.focus();
                    }   
                    else {
                        $scope.userexistsmessage = false;
                    }             
                });
            }                        
        };
        function checkStrength(password) {
            var strength = 0
            if (password.length < 6) {
                $('#pwdresult').removeClass()
                $('#pwdresult').addClass('short')
                return 'Too short'
            }
            if (password.length > 7) strength += 1
            // If password contains both lower and uppercase characters, increase strength value.
            if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) strength += 1
            // If it has numbers and characters, increase strength value.
            if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) strength += 1
            // If it has one special character, increase strength value.
            if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1
            // If it has two special characters, increase strength value.
            if (password.match(/(.*[!,%,&,@,#,$,^,*,?,_,~].*[!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1
            // Calculated strength value, we can return messages
            // If value is less than 2
            if (strength < 2) {
                $('#pwdresult').removeClass()
                $('#pwdresult').addClass('weak')
                return 'Weak'
            } else if (strength == 2) {
                $('#pwdresult').removeClass()
                $('#pwdresult').addClass('good')
                return 'Good'
            } else {
                $('#pwdresult').removeClass()
                $('#pwdresult').addClass('strong')
                return 'Strong'
            }
        };
        $scope.checkPasswordStrength = function () {         
            $('#pwdresult').html(checkStrength($('#suppassword').val()));
        };        
}]);

app.controller('LeftBannerCtrl', ['$scope', '$resource', '$routeParams', 
    function($scope, $resource, $routeParams) {
        $scope.classid = $routeParams.id;
        var Categories = $resource('/api/products/categories');
        Categories.query(function(categories){            
            $scope.categories = categories;
        });
}]);


app.controller('HomeCtrl', ['$scope', '$resource', 'commonservice','$timeout','$filter', 
    function($scope, $resource, commonservice, $timeout,$filter){ 
        $scope.currentPage = 0;        
        $scope.pageSize = 8;
        $scope.data = [];        

        var Products = $resource('/api/products');                
        Products.query(function(products){
            $scope.products = products;  
            if($scope.products != null) {
                angular.forEach($scope.products, function(value, key) {
                    value.myquantity = 1;
                });
                $scope.data = $scope.products;
            };  
        }); 

        $scope.getData = function () {
          return $filter('filter')($scope.data)
        }

        $scope.numberOfPages=function(){
            return Math.ceil($scope.getData().length/$scope.pageSize);                
        }                

        $scope.isadmin = commonservice.getIsAdmin();      
        $scope.searchField = {
            title: ''
        }           
        $scope.addtocart = function (product)
        {          
            Products = $resource('/api/products/addtocart');
            Products.save({pid:product._id, qty:product.myquantity}, function(response) 
            {                
                $('#toTopHover').click();
                console.log(response);
                if(response.result) {                                        
                    $scope.showFailure = false;
                    $scope.showSuccess = true;                           
                    $scope.successmessage = response.message;
                    $timeout(function() {
                        $scope.showSuccess = false;    
                    }, 2000);             

                }                
                else {                    
                    $scope.showSuccess = false;
                    $scope.showFailure = true;                                        
                    $scope.failuremessage = response.message;
                    $timeout(function() {
                        $scope.showFailure = false;    
                    }, 2000);             
                }            
            });                        
        };
}]);

app.controller('CategoryCtrl', ['$scope', '$resource', '$routeParams', 'commonservice','$filter',
    function($scope, $resource, $routeParams, commonservice,$filter){       

        $scope.currentPage = 0;        
        $scope.pageSize = 8;
        $scope.data = [];        
        
        var Products = $resource('/api/products/categories/:id',{id:'@_id'});        
        Products.query({ id: $routeParams.id }, function(products){
            $scope.products = products;    
            if($scope.products != null) {
                angular.forEach($scope.products, function(value, key) {
                    value.myquantity = 1;
                });
                $scope.data = $scope.products;
            }  
        });
        
        $scope.searchField = {
            title: ''
        }

        $scope.getData = function () {
          return $filter('filter')($scope.data)
        }

        $scope.numberOfPages=function(){
            return Math.ceil($scope.getData().length/$scope.pageSize);                
        }
}]);

app.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});

app.controller('ProductCtrl', ['$scope', '$resource', '$location', '$routeParams', 'commonservice', 
    function($scope, $resource, $location, $routeParams, commonservice){        
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

app.controller('CartCtrl', ['$scope', '$resource', '$location', '$routeParams', 'commonservice','$route', 
    function($scope, $resource, $location, $routeParams, commonservice,$route){
        var Cart = $resource('/api/products/cart');
        $scope.empty = true;
        $scope.notempty = false;
        var total = 0;            
        Cart.query(function(cartitems){                                    
            $scope.cartitems = cartitems;            
            if (cartitems.length == 0)          
            {
                console.log("empty");
                $scope.empty = true;
                $scope.notempty = false;
            }
            else                
            {
                console.log("notempty");
                $scope.empty = false;
                $scope.notempty = true;
            }            
        });             
        
        $scope.changeqty = function(){            

        };

        $scope.removeItem = function(cartid){
            Cart.delete({ id:  cartid}, function(cartObj){                    
                $route.reload();
            });
        };

        $scope.getTotal = function(){
            var total = 0;            
            if ($scope.cartitems != undefined && $scope.cartitems != null && $scope.cartitems.length != 0)
            {
                for (var i =0 ;i<$scope.cartitems.length;i++)
                {
                    total += parseFloat($scope.cartitems[i].acprice);
                }       
            }                        
            return total.toFixed(2);
        };


        $scope.checkout = function()
        {                    
            // console.dir($scope.cartitems);
            // remove items from cart
            var userdid = 1;            
            var orders = $resource('/api/products/orders');                                                            
            $scope.cartitems.forEach(function(cartObj)
            {
                orders.save({userid:cartObj.userid, productid:cartObj.productid, quantity:cartObj.quantity,price:cartObj.acprice}, function() 
                {                    
                });                
                var prod = $resource('/api/products/'.concat(cartObj.productid));
                prod.get({}, function(product)
                {
                    // console.dir(product);  
                    var cproduct = $resource('/api/products/editproduct');      
                    cproduct.save({_id:cartObj.productid, quantity:product.quantity - parseInt(cartObj.quantity), title:product.title, description: product.description, price:product.price},function()
                    {
                        Cart.delete({ id: cartObj._id }, function(cartsobj){
                            
                        });
                    });
                //var cproduct = $resource('/api/products/editproduct');                
                // console.log("here");
                // console.dir(cproduct);
                //cproduct.save({_id:cartObj.productid, quantity:parseInt(cartObj.quantity)},function(){
                });                
            });
        }
    
    }]);    

app.controller('AddProductCtrl', ['$scope', '$resource', '$timeout', '$window', 'Upload', 'commonservice', 
    function($scope, $resource, $timeout, $window, Upload, commonservice) {      
        $scope.showSuccess = false;
        $scope.showFailure = false;  
        $scope.newCaltegory = 'New Category';
        $scope.newCat = false;
        var Categories = $resource('/api/products/categories');
        Categories.query(function(categories){            
            $scope.categoriesAP = categories;
        });
        $scope.addProduct = function () {            
            $scope.product.picture = $scope.fileforupload.name.split('.')[0];
            var AddProduct = $resource('/api/products/addproduct');            
            AddProduct.save($scope.product, function(response) {
                $('#toTopHover').click();
                if(response.result) {
                    try {
                        Upload.upload({url:'/api/products/upload', data:{file:$scope.fileforupload}}).then(function() {}, function() {});
                    }                    
                    catch(e) {}
                    $scope.showFailure = false;
                    $scope.showSuccess = true;                           
                    $scope.successmessage = response.message;
                    $timeout(function() {
                        $window.location.href='/#/';
                    }, 3000);             
                }
                else {
                    $scope.showSuccess = false;
                    $scope.showFailure = true;                    
                    $scope.failuremessage = response.message;
                }
            });
        };
        $scope.cancel = function () {
            $window.location.href = '/#/';
        };
        $scope.displayNewCat = function () {
            if($scope.newCat) {
                $scope.newCaltegory = 'New Category';
                $scope.newCat = false;
            }
            else {
                $scope.newCaltegory = 'Existing Category';
                $scope.newCat = true;    
            }
        }
    }]);

app.service('commonservice',function()
{
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
        getIsAdmin : getIsAdmin,
        setIsAdmin : setIsAdmin,
        getIsLoggedIn : getIsLoggedIn,
        setIsLoggedIn : setIsLoggedIn
    }
});



app.directive('numbersOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
                function fromUser(text) {
                    if (text) {
                        var transformedInput = text.replace(/[^0-9-]/g, '');
                        if (transformedInput !== text) {
                            ngModelCtrl.$setViewValue(transformedInput);
                            ngModelCtrl.$render();
                        }
                        return transformedInput;
                    }
                    return undefined;
                }
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});