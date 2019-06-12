var apiUrl = location.protocol + '//' + location.host + "/api/";


if (sessionStorage.getItem("memberId") !== null && sessionStorage.getItem("cardId") !== null) {
  console.log('member is still loggen in :: ' + sessionStorage.getItem("memberId"))

  var inputData = '{' + '"partnerid" : "' + sessionStorage.getItem("memberId") + '", ' + '"cardid" : "' + sessionStorage.getItem("cardId") + '"}';

  getMemberData(inputData)

} else {
  // //remove login section
  document.getElementById('loginSection').style.display = "block";
}

//check user input and call server
$('.sign-in-member').click(function () {

  document.getElementById('loader').style.display = "block";

  //get user input data
  var memberId = $('.partner-id input').val();
  var cardId = $('.card-id input').val();

  //create json data
  var inputData = '{' + '"partnerid" : "' + memberId + '", ' + '"cardid" : "' + cardId + '"}';

  getMemberData(inputData)

});

function getMemberData(inputData) {

  //make ajax call
  $.ajax({
    type: 'POST',
    url: apiUrl + 'memberData',
    data: inputData,
    dataType: 'json',
    contentType: 'application/json',
    beforeSend: function () {
      //display loading
      document.getElementById('loader').style.display = "block";
    },
    success: function (data) {

      //remove loader
      document.getElementById('loader').style.display = "none";

      //check data for error
      if (data.error) {
        document.getElementById('loader').style.display = "none";

        alert(data.error);
        return;
      } else {

        var member = JSON.parse(inputData)

        // Save member data to local storage
        sessionStorage.setItem("memberId", member.partnerid)
        sessionStorage.setItem("cardId", member.cardid)

        //update heading
        $('.heading').html(function () {
          var str = '<h2><b> ' + data.name + ' </b></h2>';
          str = str + '<h2><b> ' + data.id + ' </b></h2>';

          return str;
        });

        // update table
        $('.data-for-table').html(function () {
          var str = '';
          var myArray = data.allCertResults
          myArray.forEach((element, index) => {
            str = str + '<tr><td>' + (index + 1) + '</td>'
              + '<td>' + element.firstName + '</td>'
              + '<td>' + element.lastName + '</td>'
              + '<td>' + element.fileHash + '</td>'
              + `<td><button class="btn btn-primary" onclick="myFunc('${element.fileHash}')">View</button></td>`
              + '</tr>';
          });

          return str;
        });

        //remove login section
        document.getElementById('loginSection').style.display = "none";
        //display transaction section
        document.getElementById('transactionSection').style.display = "block";
      }

    },
    error: function (jqXHR, textStatus, errorThrown) {
      //reload on error
      alert("Error: Try again")
      console.log(errorThrown);
      console.log(textStatus);
      console.log(jqXHR);

      location.reload();
    }
  });
}

function myFunc(params) {
  document.getElementById('loader').style.display = "block";

  const node = new Ipfs()
  node.once('ready', () => {
    node.cat(params, (err, data) => {
      if (err) return console.error(err)

      // convert Buffer back to string
      // console.log(data.toString())

      let dataurl = data.toString()
      var arr = dataurl.split(',');
      var mime = arr[0].match(/:(.*?);/)[1];

      console.log(mime);

      var blob = converBase64toBlob(arr[1], mime);
      var blobURL = URL.createObjectURL(blob);
      document.getElementById('loader').style.display = "none";
      window.open(blobURL);
    })
  })
}

//Function to Convert the base64 String to blob data
function converBase64toBlob(content, contentType) {
  contentType = contentType || '';
  var sliceSize = 512;
  var byteCharacters = window.atob(content); //method which converts base64 to binary
  var byteArrays = [];
  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize);
    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    var byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  var blob = new Blob(byteArrays, {
    type: contentType
  }); //statement which creates the blob
  return blob;
}
