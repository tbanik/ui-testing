# uitest-angular-register

http://tbanik.github.io/uitest-angular-register

##What does it do?
1. Checks to see if the email is valid, unused, and warns the user if the email may be unsafe.
2. Checks password strength against Dropbox's zxcvbn algorithm asigning 0-4 strength.
3. Checks the password doesn't use any malicious characters.
4. Requires at least a strength level 2 password.
5. Warns the user about their password if its only level 2, and encourages them to try and make it more secure.
6. Checks that the password confirmation matches the password.
7. Checks all of the final values before submitting
8. Pretends to communicate with server so I can show off my svg animation skills.
9. Returns to the account creation screen.

##Some test info to use to see all the logic at work:
* "tony.banik@gmail.com" - to see the "this email is already registered" message.
* "test@example.com" - to see the warning about possible safety issues.
* passwords:
  * try out some common passwords to see how zxcvbn works. and check out their repo listed below.
  * try using a password that is at each level to see the different results.
* and finally, make the passwords mismatch to see that error in place.

##Resources used:
* [AngularjS](https://github.com/angular/angular.js)
* [jQuery](https://github.com/jquery/jquery)
* [prefixfree](https://github.com/LeaVerou/prefixfree)
* [zxcvbn](https://github.com/dropbox/zxcvbn)
* [haveibeenpwned](https://haveibeenpwned.com/API/v2)

