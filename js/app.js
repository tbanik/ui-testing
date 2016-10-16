var app = angular.module('registerApp', []);

app.directive('dynamic', function ($compile) {
    return {
        restrict: 'A',
        replace: true,
        link: function (scope, ele, attrs) {
            scope.$watch(attrs.dynamic, function(html) {
                ele.html(html);
                $compile(ele.contents())(scope);
            });
        }
    };
});

app.controller('registerCtrl', function($scope,$http,$compile,$timeout) {

    $scope.resetData = function() {
        //Main
        $scope.email = null;
        $scope.password = null;
        $scope.passwordConfirm = null;
        $scope.pwcheck = [];
        $scope.notices = {
            "email": null,
            "pass": null,
            "passc": null
        };
        $scope.classes = {
            "email": null,
            "pass": null,
            "passc": null
        };
        $scope.loading = null;
        $scope.warnings = [false,false];
        $scope.buttonText = "Register Account";
        document.getElementsByTagName("input")[0].focus();
    }

    $scope.resetData();

    //Load error/warning responses from json
    $http.get('responses.json')
        .then(function(res){
            $scope.responses = res.data.response;
        });

    $scope.validData = function(str, toTest) {
        //password and email regex validation. Angulars regex allows for emails like "test@example" which we don't want.
        var passRe = /^[a-zA-Z0-9-_!@#$%^&*?]{0,48}$/;
        var emailRe = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (toTest == "email") {
            return emailRe.test(str);
        } else {
            return passRe.test(str);
        }
    }

    $scope.updateNotice = function(msg,classes,ele){
        this.notices[ele] = msg;
        this.classes[ele] = classes;
    }

    $scope.emailBlur = function(vc) {
        $scope.validCheck(false,0);
        //since there's no real accounts, im using my email as the "this email is already registered" account
        //but this is where you would check a db for the email
        var myEmail = "tony.banik@gmail.com";

        if (this.validData(this.email, 'email')) {
            if (this.email.toUpperCase() === myEmail.toUpperCase()) {
                $scope.updateNotice(this.responses.emailExists, "error show", "email");
            }else{
                if (vc) {
                    //checking to see if this email has been compromised in a data breach via this absurdly named website "haveibeenpwned.com"
                    $http.get('https://haveibeenpwned.com/api/v2/breachedaccount/' + this.email,{
                        params: {truncateResponse: true}
                    }).then(function(response) {
                        if (response.data.length) {
                            $scope.updateNotice($scope.responses.emailBreach, "warning show", "email");
                            if (!$scope.warnings[0]) {
                                $scope.warnings[0] = true;
                                $scope.buttonText = "Dismiss & Register";
                            }else{
                                $scope.updateNotice(null, null, "email");
                                $scope.validCheck(true,0);
                            }
                        }
                    }, function (response) {
                        $scope.updateNotice(null, null, "email");
                        $scope.validCheck(true,0);
                    });
                }else{
                    $scope.updateNotice(null, null, "email");
                }
            }
        }else if(typeof this.email == "string" && this.email == "" || typeof this.email == "object"){
            $scope.updateNotice(null, null, "email");
        }else{
            $scope.updateNotice($scope.responses.emailInvalid, "error show", "email");
        }

    }

    $scope.passOutput = function(score) {
        $scope.score = score;
        $scope.pwcheck = [];
        for (var i = 0; i < score; i++) {
            $scope.pwcheck[i+1] = "on";
        }
    }

    $scope.passChange = function() {
        if(!this.validData(this.password, 'password')){
            $scope.updateNotice($scope.responses.passIllegal, "error show", "pass");
            this.passOutput(0);
        }else{
            $scope.updateNotice(null, null, "pass");
            var score = zxcvbn(this.password);
            this.passOutput(score.score);
        }
    }

    $scope.passBlur = function(vc) {
        $scope.validCheck(false,1);
        if(!this.validData(this.password, 'password')){
            $scope.updateNotice($scope.responses.passIllegal, "error show", "pass");
            this.passOutput(0);
        }else{
            if (this.password != '') {
                if (this.score < 2) {
                    $scope.updateNotice($scope.responses.passStrError, "error show", "pass");
                }else if(this.score < 3){
                    if (vc) {
                        if (!$scope.warnings[1]) {
                            $scope.warnings[1] = true;
                            $scope.buttonText = "Dismiss & Register";
                            $scope.updateNotice($scope.responses.passStrWarning, "warning show", "pass");
                        }else{
                            $scope.updateNotice(null, null, "pass");
                            $scope.validCheck(true,1);
                        }
                    }
                }else{
                    $scope.updateNotice(null, null, "pass");
                    if (vc) {
                        $scope.validCheck(true,1);
                    }
                }
            }else{
                $scope.updateNotice(null, null, "pass");
            }
        }
    }

    $scope.passConfirmBlur = function(vc) {
        $scope.validCheck(false,2);
        if (this.password !== this.passwordConfirm) {
            $scope.updateNotice($scope.responses.passMismatch, "error show", "passc");
        }else if(typeof this.passwordConfirm == "string" && this.passwordConfirm == "" || typeof this.passwordConfirm == "object"){
            $scope.updateNotice(null, null, "passc");
        }else{
            $scope.updateNotice(null, null, "passc");
            if (vc) {
                $scope.validCheck(true,2);
            }
        }
    }

    $scope.regSubmit = function() {

        $scope.valid = [false,false,false,true ]; /* 4th value so we can compare them later*/

        if(typeof this.email == "string" && this.email == "" || typeof this.email == "object"){
            $scope.updateNotice($scope.responses.requiredField, "error show", "email");
        }else{
            this.emailBlur(true);
        }

        if(typeof this.password == "string" && this.password == "" || typeof this.password == "object"){
            $scope.updateNotice($scope.responses.requiredField, "error show", "pass");
        }else{
            this.passBlur(true);
        }

        if(typeof this.passwordConfirm == "string" && this.passwordConfirm == "" || typeof this.passwordConfirm == "object"){
            $scope.updateNotice($scope.responses.requiredField, "error show", "passc");
        }else{
            this.passConfirmBlur(true);
        }
    }

    $scope.validCheck = function(boole, id) {
        if ($scope.valid) {
            $scope.valid[id] = boole;
            if (!!$scope.valid.reduce(function(a, b){ return (a === b) ? a : NaN; })) {
                $scope.loading = "open";
                for (var i = 0; i < document.getElementsByTagName("input").length; i++) {
                    document.getElementsByTagName("input")[i].blur();
                }
                $timeout($scope.resetData, 3500);
            }
        }
    }

});