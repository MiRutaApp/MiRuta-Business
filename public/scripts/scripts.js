"use strict"; 
var app = angular.module("yapp", ["ui.router", "ngAnimate"]);
app.config(function ($stateProvider, $urlRouterProvider,$locationProvider) { 
    
    $urlRouterProvider.when("/dashboard", "/dashboard/overview"); 
    $urlRouterProvider.otherwise("/login");
    $stateProvider.state("base", { 
        "abstract": !0, 
        url: "", 
        templateUrl: "views/base.html" 
    }).state("login", { 
        url: "/login", 
        parent: "base", 
        templateUrl: "views/login.html", 
        controller: "LoginCtrl" 
    }).state("dashboard", { 
        url: "/dashboard", 
        parent: "base", 
        templateUrl: "views/dashboard.html", 
        controller: "DashboardCtrl" 
    }).state("overview", { 
        url: "/overview", 
        parent: "dashboard", 
        templateUrl: "views/dashboard/overview.html" 
    }).state("rutas", { 
        url: "/Rutas", 
        parent: "dashboard", 
        templateUrl: "views/dashboard/rutas.html" 
    }).state("unidades", { 
        url: "/Unidades", 
        parent: "dashboard", 
        templateUrl: "views/dashboard/unidades.html" 
    }).state("conductores", { 
        url: "/Conductores", 
        parent: "dashboard", 
        templateUrl: "views/dashboard/conductores.html" 
    });
    
    $locationProvider.html5Mode(true);
});
app.controller("LoginCtrl", function ($scope, $location) { 
    $scope.submit = function () { 
        return $location.path("/dashboard");
    } 
});

app.controller("DashboardCtrl",function ($scope, $state ) { 
    $scope.$state = $state 
});