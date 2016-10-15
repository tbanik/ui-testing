var app = angular.module('registerApp', []);

app.controller('registerCtrl', function($scope,$http) {

    $scope.email= "";
    $scope.password= "";
    $scope.passwordConfirm= "";
    $scope.score = 0;

    //All my error texts, definately a better place for these...
    $scope.emailError = 'Oops! This email is already registered. If you forgot your password, <a href="#" onclick="return false;">click here to reset it.</a>';
    $scope.emailValidError = "This doesn't appear to be a valid email. We are looking for something along the lines of &quot;test@example.com&quot;";
    $scope.emailBreachError = "Are you sure this email is secure? According to <a href='https://haveibeenpwned.com/account/EMAILHERE' target='_blank'>haveibeenpwned.com</a> this email has been compromised in at least one past data breach. Click the link to find the list of websites. If you choose to still use this email, please make sure you use a different password.";

    $scope.passError = "Sorry, your password strength must be at least level 2 to register. Try adding another word or two.";
    $scope.passWarning = "Are you sure you want to use that password? Your safety is our highest priority, which is why we recommend a password of strength level 3 or higher.";
    $scope.passRegexError = 'Please only use alphanumeric characters and the following special characters "-_!@#$%^&*?"';
    $scope.passMismatchError = "Your passwords do not match, please re-type them to ensure your account information is correct.";

    var regex = /^[a-zA-Z0-9-_!@#$%^&*?]{0,48}$/

    $scope.validEmail = function(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    $scope.emailBlur = function(e) {
        var myEmail = "tony.banik@gmail.com";
        //since there's no real accounts, im using my email as the "this email is already registered" account
        //but this is where you would check a db for the email

        if (this.validEmail(this.email)) {
            if (this.email === myEmail) {
                $(e.target).parent().children('.register-input-notice').
                    removeClass('error warning show').
                    html(this.emailError).
                    addClass('error show');
            }else{
                //here is where we're checking to see if this email has been compromised in a data breach via this absurdly named website "haveibeenpwned.com"
                $http({
                  method: 'GET',
                  url: 'https://haveibeenpwned.com/api/v2/breachedaccount/' + this.email,
                  params: {truncateResponse: true, element: e.target, message: this.emailBreachError}
                }).then(function successCallback(response) {
                    if (response.data.length) {
                        var mess = response.config.params.message;
                        mess = mess.split('EMAILHERE');
                        mess = mess[0] + $scope.email + mess[1];
                        $(response.config.params.element).parent().children('.register-input-notice').
                            removeClass('error warning show').
                            html(mess).
                            addClass('warning show');
                    }
                }, function errorCallback(response) {
                    $(response.config.params.element).parent().children('.register-input-notice').
                        removeClass('error warning show').
                        html('');
                });
            }
        }else{
            $(e.target).parent().children('.register-input-notice').
                removeClass('error warning show').
                html(this.emailValidError).
                addClass('error show');
        }

    }

    $scope.passOutput = function(score) {
        $scope.score = score;
        $('.seg').removeClass('on');
        for (var i = 0; i < score; i++) {
            $('.seg').eq(i).addClass('on');
        }
    }

    $scope.passChange = function(e) {
        var notice = $('#password').parent().children('.register-input-notice');
        if(!regex.test(this.password)){
            notice.removeClass('error warning show');
            notice.html(this.passRegexError).addClass('error show');
        }else{
            notice.removeClass('error warning show');
            var score = zxcvbn(this.password);
            this.passOutput(score.score);
        }
    }

    $scope.passBlur = function(e) {
        var notice = $(e.target).parent().children('.register-input-notice');
        if (this.password != '') {
            if (this.score < 2) {
                notice.removeClass('error warning show');
                notice.html(this.passError).addClass('error show');
            }else if(this.score < 3){
                notice.removeClass('error warning show');
                notice.html(this.passWarning).addClass('warning show');
            }else{
                notice.removeClass('error warning show').html('');
            }
        }else{
            notice.removeClass('error warning show');
        }
    }

    $scope.passConfirmBlur = function(e) {
        var notice = $(e.target).parent().children('.register-input-notice');
            notice.removeClass('error warning show');
        if (this.password !== this.passwordConfirm) {
            notice.html(this.passMismatchError).addClass('error show');
        }
    }

});