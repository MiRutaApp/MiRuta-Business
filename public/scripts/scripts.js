"use strict";
var app = angular.module("yapp", ["ui.router", "ngAnimate", "ngMap"]);

var Empresa = Parse.Object.extend("Empresa");
var Ruta = Parse.Object.extend("Ruta");
var Unidad = Parse.Object.extend("Unidad");
app.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
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
        templateUrl: "views/dashboard/overview.html",
        controller: "MapaCtrl"
    }).state("rutas", {
        url: "/Rutas",
        parent: "dashboard",
        templateUrl: "views/dashboard/rutas.html",
        controller: "RutasCtrl"
    }).state("unidades", {
        url: "/Unidades",
        parent: "dashboard",
        templateUrl: "views/dashboard/unidades.html",
        controller: "UnidadesCtrl"
    }).state("conductores", {
        url: "/Conductores",
        parent: "dashboard",
        templateUrl: "views/dashboard/conductores.html",
        controller: "ConductoresCtrl"
    });
    $locationProvider.html5Mode(true);
});
app.run(function () {
    Parse.initialize("449e9382040418fff7bd75dfae5c6a7260abbc69");
    Parse.serverURL = 'http://miruta.frikicorp.com/parse';
});
app.controller("LoginCtrl", function ($scope, $location, $log, $timeout) {
    $scope.login = function () {
        $log.log("Login Start");
        Parse.User.logIn($scope.email, $scope.password, {
            success: function (user) {
                $log.log("Login", user);
                swal({
                    title: "Usuario Verificado ",
                    text: "Bienvenido",
                    type: "success",
                    showCancelButton: false
                }, function () {
                    $timeout(function () {
                        return $location.path("/dashboard");
                    }, 1);
                });
            },
            error: function (user, error) {
                $log.log("Login Error", error);
                swal({
                    title: "Acceso Denegado ",
                    text: "Verifique sus datos",
                    type: "info",
                    showCancelButton: false
                });
            }
        });
    }
});
app.controller("DashboardCtrl", function ($scope, $state, $log) {
    $scope.$state = $state;
    $log.log("empresa", Parse.User.current().get("empresa").get("nombre"));
    var query = new Parse.Query(Empresa);
    query.get(Parse.User.current().get("empresa").id, {
        success: function (empresa) {
            $scope.nombreEmpresa = empresa.get("nombre");
            $log.log("empresa", empresa.get("nombre"));
        },
        error: function (object, error) {
            $log.log("empresa", error);
        }
    });
});
app.controller("RutasCtrl", function ($scope, $log, $http) {
    $scope.$watch("ruta",function(newValue,oldValue){
        $log.log(newValue);
    });

    var directionsService = new google.maps.DirectionsService;
    $scope.rutas = [];
    var queryRutas = new Parse.Query(Ruta);
    queryRutas.equalTo("empresa", Parse.User.current().get("empresa"));
    queryRutas.find({
        success: function (rutas) {
            $scope.rutas = [];
            for (var key in rutas) {
                var ruta = rutas[key];
                var aux = {
                    nombre: ruta.get("nombre"),
                    camino: ruta.get("camino"),
                    id: ruta.id,
                };
                $scope.rutas.push(aux);
            }
            $log.log("rutas", $scope.rutas);
            $scope.$apply();
            for (var key in $scope.rutas) {
                var ruta = $scope.rutas[key];
                var origin = new google.maps.LatLng({ lat: ruta.camino[0]._latitude, lng: ruta.camino[0]._longitude });
                var waypoints = [];
                if (ruta.camino.length > 2) {
                    for (var a = 1; a < ruta.camino.length - 1; a++) {
                        var punto = ruta.camino[a];
                        waypoints.push({ location: new google.maps.LatLng({ lat: punto._latitude, lng: punto._longitude }), stopover: true });
                    }
                }
                var destination = new google.maps.LatLng({ lat: ruta.camino[ruta.camino.length - 1]._latitude, lng: ruta.camino[ruta.camino.length - 1]._longitude });
                $log.log("origin", origin);
                $log.log("waypoints", waypoints);
                $log.log("destination", destination);
                $scope.getRoutePolyline(ruta, origin, waypoints, destination);
            }
        },
        error: function (object, error) {
            $log.log("rutas", error);
        }
    });
    $scope.getRoutePolyline = function (route, origin, waypoints, destination) {
        directionsService.route({
            origin: origin,
            waypoints: waypoints,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING
        }, function (response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                route.polyline = response.routes[0].overview_polyline;
                $log.log(route.nombre, route);
                $scope.$apply();
            } else {
                $log.log("fail", status);
            }
        });
    };



});
app.controller("UnidadesCtrl", function ($scope, $log) {
    $log.log("empresa", Parse.User.current().get("empresa").get("nombre"));
    $scope.unidades = [];
    var queryRutas = new Parse.Query(Ruta);
    queryRutas.equalTo("empresa", Parse.User.current().get("empresa"));
    queryRutas.find({
        success: function (rutas) {
            var queryUnidades = new Parse.Query(Unidad);
            queryUnidades.containedIn("ruta", rutas);
            queryUnidades.include("ruta");
            queryUnidades.include("chofer");
            queryUnidades.find({
                success: function (unidades) {
                    $log.log("unidades", unidades);
                    for (var key in unidades) {
                        var unidad = unidades[key];
                        $scope.unidades.push({
                            id: unidad.id,
                            nombre: unidad.get("nombre"),
                            capacidad: unidad.get("capacidad"),
                            estado: unidad.get("estado"),
                            ruta: {
                                nombre: unidad.get("ruta").get("nombre"),
                                id: unidad.get("ruta").id,
                            },
                            chofer: {
                                foto: unidad.get("chofer").get("foto"),
                                nombre: unidad.get("chofer").get("nombre"),
                                id: unidad.get("chofer").id
                            }
                        });
                    }
                    $log.log("unidades", $scope.unidades);
                    $scope.$apply();
                }, error: function (data, status) {
                    $log.log("error", status);
                }
            });

        }, error: function (data, status) {
            $log.log("rutas", error);
        }
    });

    $scope.propertyName = 'id';
    $scope.reverse = true;

    $scope.sortBy = function (propertyName) {
        $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
        $scope.propertyName = propertyName;
    };
});
app.controller("ConductoresCtrl", function ($scope, $log) {
    $log.log("empresa", Parse.User.current().get("empresa").get("nombre"));
    $scope.conductores = [];
    var query = new Parse.Query(Parse.User);
    query.equalTo("empresa", Parse.User.current().get("empresa"));
    query.find({
        success: function (conductores) {
            for (var key in conductores) {
                var conductor = conductores[key];
                $scope.conductores.push({
                    id: conductor.id,
                    nombre: conductor.get("nombre"),
                    foto: conductor.get("foto")
                })
            }
            $scope.$apply();
        }, error: function (data, status) {
            $log.log("rutas", error);
        }
    });


});
app.controller("MapaCtrl", function ($scope, $log, $interval) {

    $scope.medirCapacidad = function (estado, capacidad) {
        var rate = estado / capacidad;
        if (rate < 0.25) {
            return "green"
        } else if (rate < 0.7) {
            return "orange"
        } else {
            return "red"
        }
    }
    $scope.randomColor = function () {
        return Math.floor(Math.random() * 16777215).toString(16);
    }
    var directionsService = new google.maps.DirectionsService;
    $scope.rutas = [];
    $scope.unidades = [];
    var queryRutas = new Parse.Query(Ruta);
    queryRutas.equalTo("empresa", Parse.User.current().get("empresa"));
    queryRutas.find({
        success: function (rutas) {
            $scope.resRutas = rutas;
            $scope.rutas = [];
            for (var key in rutas) {
                var ruta = rutas[key];
                var aux = {
                    nombre: ruta.get("nombre"),
                    camino: ruta.get("camino"),
                    id: ruta.id,
                };
                $scope.rutas.push(aux);
            }
            for (var key in $scope.rutas) {
                var ruta = $scope.rutas[key];
                var origin = new google.maps.LatLng({ lat: ruta.camino[0]._latitude, lng: ruta.camino[0]._longitude });

                ruta.points = [];
                ruta.points.push([ruta.camino[0]._latitude, ruta.camino[0]._longitude]);
                var waypoints = [];
                if (ruta.camino.length > 2) {
                    for (var a = 1; a < ruta.camino.length - 1; a++) {
                        var punto = ruta.camino[a];
                        waypoints.push({ location: new google.maps.LatLng({ lat: punto._latitude, lng: punto._longitude }), stopover: true });
                        ruta.points.push([punto._latitude, punto._longitude]);
                    }
                }
                var destination = new google.maps.LatLng({ lat: ruta.camino[ruta.camino.length - 1]._latitude, lng: ruta.camino[ruta.camino.length - 1]._longitude });
                ruta.points.push([ruta.camino[ruta.camino.length - 1]._latitude, ruta.camino[ruta.camino.length - 1]._longitude]);
                ruta.color = "#" + $scope.randomColor();
                $scope.getRoutePolyline(ruta, origin, waypoints, destination);


            }
            $log.log("rutas", $scope.rutas);
            $scope.$apply();


            var queryUnidades = new Parse.Query(Unidad);
            queryUnidades.containedIn("ruta", $scope.resRutas);
            queryUnidades.include("ruta");
            queryUnidades.include("chofer");
            queryUnidades.find({
                success: function (unidades) {
                    $scope.unidades = [];
                    for (var key in unidades) {
                        var unidad = unidades[key];
                        $scope.unidades.push({
                            id: unidad.id,
                            nombre: unidad.get("nombre"),
                            capacidad: unidad.get("capacidad"),
                            estado: unidad.get("estado"),
                            ruta: {
                                nombre: unidad.get("ruta").get("nombre"),
                                id: unidad.get("ruta").id,
                            },
                            chofer: {
                                foto: unidad.get("chofer").get("foto"),
                                nombre: unidad.get("chofer").get("nombre"),
                                id: unidad.get("chofer").id
                            },
                            posicion: [unidad.get("posicion")._latitude, unidad.get("posicion")._longitude]
                        });
                    }
                    $scope.$apply();
                }, error: function (data, status) {
                    $log.log("error", status);
                }
            });
            $interval(function () {
                var queryUnidades = new Parse.Query(Unidad);
                queryUnidades.containedIn("ruta", $scope.resRutas);
                queryUnidades.include("ruta");
                queryUnidades.include("chofer");
                queryUnidades.find({
                    success: function (unidades) {
                        $scope.unidades = [];
                        for (var key in unidades) {
                            var unidad = unidades[key];
                            $scope.unidades.push({
                                id: unidad.id,
                                nombre: unidad.get("nombre"),
                                capacidad: unidad.get("capacidad"),
                                estado: unidad.get("estado"),
                                ruta: {
                                    nombre: unidad.get("ruta").get("nombre"),
                                    id: unidad.get("ruta").id,
                                },
                                chofer: {
                                    foto: unidad.get("chofer").get("foto"),
                                    nombre: unidad.get("chofer").get("nombre"),
                                    id: unidad.get("chofer").id
                                },
                                posicion: [unidad.get("posicion")._latitude, unidad.get("posicion")._longitude]
                            });
                        }
                        $scope.$apply();
                    }, error: function (data, status) {
                        $log.log("error", status);
                    }
                });
            }, 50000);
        },
        error: function (object, error) {
            $log.log("rutas", error);
        }
    });
    $scope.getRoutePolyline = function (route, origin, waypoints, destination) {
        directionsService.route({
            origin: origin,
            waypoints: waypoints,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING
        }, function (response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                route.polyline = response.routes[0].overview_polyline;
                $log.log(route.nombre, route);
                $scope.$apply();
            } else {
                $log.log("fail", status);
            }
        });
    };





});