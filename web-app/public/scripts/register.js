var apiUrl = location.protocol + '//' + location.host + "/api/";

console.log("at register.js");

$('.upload-cert').click(function () {

  var files = document.getElementById('customFile').files[0]; //Files[0] = 1st file

  console.log("1 :: " + files.name)

  var reader = new FileReader();
  reader.readAsDataURL(files);

  reader.onload = function () {
    // Send Certificate data to IPFS   
    const node = new Ipfs()
  
    const { Buffer } = Ipfs
    node.once('ready', () => {
      node.add(new Buffer(reader.result), (err, filesAdded) => {
        if (err) {
          return console.error('Error - ipfs add', err, res);
        }
        filesAdded.forEach((file) => {
          sendCertToChain(files, file);
        });
      });
    })
  }
})
  

function sendCertToChain(originalFile, ipfsFile) {

  //get user input data
  var memberId = sessionStorage.getItem("memberId")
  var formCardId = sessionStorage.getItem("cardId")
  var fileName = originalFile.name;
  var formFileHash = ipfsFile.hash;
  var studentFirstName = $('.firstName input').val();
  var studentLastName = $('.lastName input').val();

  //create json data
  var inputData = '{' + '"fileHash" : "' + formFileHash + '", ' + '"fileName" : "' + fileName + '", ' + '"firstName" : "' + studentFirstName + '", ' + '"lastName" : "' + studentLastName + '",' + '"memberId" : "' + memberId + '", ' + '"cardId" : "' + formCardId + '"}';
  console.log(inputData)

  //make ajax call to add the dataset
  $.ajax({
    type: 'POST',
    url: apiUrl + 'addCert',
    data: inputData,
    dataType: 'json',
    contentType: 'application/json',
    beforeSend: function () {
      //display loading
      document.getElementById('successful-registration').style.display = "none";

      document.getElementById('loader').style.display = "block";
    },
    success: function (data) {
      //remove loader
      document.getElementById('loader').style.display = "none";

      //check data for error
      if (data.error) {
        alert(data.error);
        return;
      } else {
        //notify successful registration
        document.getElementById('successful-registration').style.display = "block";
        console.log('File Data saved to Blockchain')
      }

    },
    error: function (jqXHR, textStatus, errorThrown) {
      //reload on error
      //remove loader
      document.getElementById('loader').style.display = "none";

      alert("Error: Try again")
      console.log(errorThrown);
      console.log(textStatus);
      console.log(jqXHR);
    }
  });
}

//check user input and call server to create dataset
$('.register-member').click(function () {

  //get user input data
  var formName = $('.name input').val();
  var formPartnerId = $('.partner-id input').val();
  var formCardId = $('.card-id input').val();

  //create json data
  var inputData = '{' + '"name" : "' + formName + '", ' + '"memberid" : "' + formPartnerId + '", ' + '"cardid" : "' + formCardId + '"}';

  //make ajax call to add the dataset
  $.ajax({
    type: 'POST',
    url: apiUrl + 'registerMember',
    data: inputData,
    dataType: 'json',
    contentType: 'application/json',
    beforeSend: function () {
      //display loading
      document.getElementById('registration').style.display = "none";
      document.getElementById('loader').style.display = "block";
    },
    success: function (data) {

      //remove loader
      document.getElementById('loader').style.display = "none";

      //check data for error
      if (data.error) {
        document.getElementById('registration').style.display = "block";
        alert(data.error);
        return;
      } else {
        //notify successful registration
        document.getElementById('successful-registration').style.display = "block";
        document.getElementById('registration-info').style.display = "none";
      }

    },
    error: function (jqXHR, textStatus, errorThrown) {
      //reload on error
      alert("Error: Try again")
      console.log(errorThrown);
      console.log(textStatus);
      console.log(jqXHR);
    }
  });

});