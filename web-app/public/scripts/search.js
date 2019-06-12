var apiUrl = location.protocol + '//' + location.host + "/api/";

console.log("at search.js");

//check user input and call server to create dataset
$('.get-cert').click(function () {

  //get user input data
  var fileHash = $('.hashCode input').val();

  //create json data
  var inputData = '{' + '"fileHash" : "' + fileHash + '"}';
  console.log(inputData)

  //make ajax call to add the dataset
  $.ajax({
    type: 'POST',
    url: apiUrl + 'certificate',
    data: inputData,
    dataType: 'json',
    contentType: 'application/json',
    beforeSend: function () {
      //display loading
      // document.getElementById('registration').style.display = "none";
      document.getElementById('loader').style.display = "block";
    },
    success: function (data) {

      //remove loader
      document.getElementById('loader').style.display = "none";
      console.log(data)

      //check data for error
      if (data.error) {
        // document.getElementById('registration').style.display = "block";
        alert(data.error);
        return;
      } else {
        // <button class="btn btn-primary btn-lg btn-block upload-cert" type="submit">Upload Certificate</button>

        //notify successful registration
        document.getElementById('certSection').style.display = "block";
        sessionStorage.setItem("hash", data.cert.fileHash);
        sessionStorage.setItem("name", data.cert.fileName);
        //   document.getElementById('registration-info').style.display = "none";
        $('.heading').html(function () {
          var str = '<p><h3>Student Data</h3></p><hr>';
          str = str + '<p><h3> First Name : ' + data.cert.firstName + ' </p></h3>';
          str = str + '<p><h3> Last Name : ' + data.cert.lastName + ' </p></h3><br>';
          // str = str + `<p><h3>Download Link : <a href=http://ipfs.io/ipfs/ + ${data.cert.fileHash} > Download Certificate</a></h3></p>`;
          str = str + `<p><button onClick="getFile()" class="btn btn-primary btn-lg btn-block" getFile>Download Certificate</button>
          </p>`;

          return str;
        });
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

function getFile() {
  document.getElementById('loader').style.display = "block";
  const node = new Ipfs()

  node.once('ready', () => {
    node.cat(sessionStorage.getItem("hash"), (err, data) => {
      if (err) return console.error(err)

      let dataurl = data.toString()
      var arr = dataurl.split(',');
      var mime = arr[0].match(/:(.*?);/)[1];

      // let newData = str_replace("data:image/jpeg;base64,", "", data.toString());
      // window.open("data:application/pdf;base64," + Base64.encode(newData));
      // var file = dataURLtoFile(data.toString, sessionStorage.getItem("name"));

      var blob = converBase64toBlob(arr[1], mime);
      var blobURL = URL.createObjectURL(blob);
      document.getElementById('loader').style.display = "none";

      window.open(blobURL);
    })
  })
}

function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

//Function to Convert the base64 String to blob data
function converBase64toBlob(content, contentType) {
  contentType = contentType || '';
  var sliceSize = 512;
  var byteCharacters = window.atob(content); //method which converts base64 to binary
  var byteArrays = [
  ];
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
