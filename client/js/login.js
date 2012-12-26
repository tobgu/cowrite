
var loginManager = {
		
   setLoggedIn: function() {
       $.ajax({
           type: "GET",
           url: "../loggedin",
           dataType: "json",
           error: function(XMLHttpRequest, textStatus, errorThrown) { 
             $('div#loginContent').text("Error: " + XMLHttpRequest.responseText 
               + ", textStatus: " + textStatus 
               + ", errorThrown: " + errorThrown);
             $('div#loginContent').addClass("error");
           }, // error 

           success: function(data) {
        	 console.log(data)
             if (data.loggedin) {
                 window.location='texts.html'
             }
           }
         });
   },

   login: function() {
       var username = $('#username').attr('value'); // get username
       var password = $('#password').attr('value'); // get password
      
       if (username && password) { // values are not empty
         $.ajax({
           type: "POST",
           url: "../login",
           dataType: "json",
           data: {'username': username, 'password': password},
           error: function(XMLHttpRequest, textStatus, errorThrown) { 
             $('div#loginResult').text("Error: " + XMLHttpRequest.responseText 
               + ", textStatus: " + textStatus 
               + ", errorThrown: " + errorThrown);
             $('div#loginResult').addClass("error");
           }, // error 

           success: function(data) {
        	 console.log(data)
             if (data.error) { // script returned error
               $('div#loginResult').text(data.error);
               $('div#loginResult').addClass("error");
             } else { // login was successful
               window.location='texts.html'
             }
           }
         });
       } else {
         $('div#loginResult').text("Enter username and password");
         $('div#loginResult').addClass("error");
       }
       $('div#loginResult').fadeIn();
       return false;
   }
}
    
$(document).ready(function() { 
	$("form#loginForm").submit(loginManager.login);
	loginManager.setLoggedIn();
	});
