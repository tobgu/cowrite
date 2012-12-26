/**

*/

var textManager = {
		
		
   setLoggedIn: function() {
	   $.ajax({
		   success: function(result) {
			   if(!result.loggedin) {
				  console.log("Not logged in");
			   	  $("div#createContent").html("<p>Not logged in. <a href=\"login.html\">Log in</a> to create new texts.<p>")
			   }
		   },
		   error: function() {
			   console.log("Failed to fetch login status");
		   },
		   type: 'GET',
		   dataType: 'json',
		   url: "../loggedin",
		});
   },
		
   fetchTexts: function() {

      $.ajax(
      {
         success: textManager.listTexts,
         error: function() {
            console.log("Failed to fetch texts");
         },
         processData: false,
         type: 'GET',
         dataType: 'json',
         url: "../texts",
      });
   },

   listTexts: function(data) {
      for (i in data.texts) {
         var text = data.texts[i];
         textManager.appendText(text); 
      }
   },
   
   appendText: function(text) {   
      console.log(text)
      var table = document.getElementById('textsTable');
      
      var numRows = table.rows.length;
      var newRow = table.insertRow(numRows);
  
      //create new cells
      var newCell1 = newRow.insertCell(0);
      var newCell2 = newRow.insertCell(1);
      var newCell3 = newRow.insertCell(2);
  
      //set the cell text
      newCell1.innerHTML = text.name;
      newCell2.innerHTML = text.lastupdate;
      newCell3.innerHTML = text.updatedby;  
   },
   
   createText: function() {
      var textname = $('#textname').attr('value');

      $.ajax(
      {
         data: { "initialTextlet": "Tjo!" },
         dataType: 'json',
         success: textManager.appendText,
         error: function() {
            console.log("Failed to create text");
         },
         type: 'PUT',
         url: "../texts/" + textname,
      });
      
      return false;
   }
}

$(document).ready(function() { 
	$("form#createForm").submit(textManager.createText);
	textManager.setLoggedIn();
	textManager.fetchTexts();
});
