
var registrationManager = {
   setErrorLabel: function(text) {
       $('div#registrationResult').text(text);
       $('div#registrationResult').addClass("error");
       $('div#registrationResult').fadeIn();
   },
   
   setSuccessLabel: function() {
       $('div#registrationResult').html("Success, <a href=\"login.html\">Log in</a>");
       $('div#registrationResult').addClass("success");
       $('div#registrationResult').fadeIn();
   },

   register: function() {
	   console.log("Hej")
       var username = $('#username').attr('value');
       var firstname = $('#firstname').attr('value');
       var lastname = $('#lastname').attr('value');
       var password = $('#password').attr('value');
       var repeatedPassword = $('#repeatedpassword').attr('value');
       
       if(!username) {
    	   registrationManager.setErrorLabel("User name is missing");
    	   return false;
       }
	   
       if(!password) {
    	   registrationManager.setErrorLabel("Password is missing");
    	   return false;
       }

       if(password != repeatedPassword) {
    	   registrationManager.setErrorLabel("Passwords differ");
    	   return false;
       }

       if(!firstname) {
    	   registrationManager.setErrorLabel("Firstname is missing");
    	   return false;
       }
       
       if(!lastname) {
    	   registrationManager.setErrorLabel("Lastname is missing");
    	   return false;
       }
       
       $.ajax({
           type: "POST",
           url: "../register",
           dataType: "json",
           data: {'username': username, 'password': password, 'firstname': firstname, 'lastname': lastname},
           error: function(XMLHttpRequest, textStatus, errorThrown) { 
        	   registrationManager.setErrorLabel("Error: " + XMLHttpRequest.responseText 
               + ", textStatus: " + textStatus 
               + ", errorThrown: " + errorThrown);
           }, // error 

           success: function(data) {
        	 console.log(data)
             if (data.error) { // script returned error
               registrationManager.setErrorLabel(data.error);
             } else { // registration successful
               registrationManager.setSuccessLabel()
             }
           }
         });
   
	   return false;
   }
}


$(document).ready(function() {
	console.log("Registering...");
	$("form#registrationForm").submit(registrationManager.register);
	});
