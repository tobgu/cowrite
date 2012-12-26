/**

*/

var cowrite = {
   fetchWrites: function() {
      $.ajax(
      {
         success: cowrite.listWrites,
         error: function(){
            app.log("Device control failed");
         },
         processData: false,
         type: 'GET',
         dataType: 'json',
         url: "../writes/testname",
      });
   },

   listWrites: function(writes) {
      for (i in writes) {
         var write = writes[i];
         cowrite.appendWrite(write); 
      }
   },
   
   appendWrite: function(write) {   
      console.log(write)
      var table = document.getElementById('writesTable');
      
      var numRows = table.rows.length;
      var newRow = table.insertRow(numRows);
  
      //create new cells
      var newCell1 = newRow.insertCell(0);
      var newCell2 = newRow.insertCell(1);
      var newCell3 = newRow.insertCell(2);
  
      //set the cell text
      newCell1.innerHTML = write.author;
      newCell2.innerHTML = write.date;
      newCell3.innerHTML = write.text;  
   },
   
   submitWrite: function() {
      var input = document.getElementById('submitWrite');
      $.ajax(
      {
         contentType: 'application/json',
         data: JSON.stringify({ "text": input.value }),
         dataType: 'json',
         success: cowrite.appendWrite,
         error: function(){
            app.log("Device control failed");
         },
         processData: false,
         type: 'POST',
         url: "../writes/testname",
      });
   }
}

$(function(){cowrite.fetchWrites();});