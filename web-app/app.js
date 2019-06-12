'use strict';

//get libraries
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path')

//create express web-app
const app = express();
const router = express.Router();

//get the libraries to call
var network = require('./network/network.js');
var validate = require('./network/validate.js');
// var analysis = require('./network/analysis.js');

//bootstrap application settings
app.use(express.static('./public'));
app.use('/scripts', express.static(path.join(__dirname, '/public/scripts')));
app.use(bodyParser.json());


// static web ppage endpoints
// =========================================================================

//get home page
app.get('/home', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

//get search page
app.get('/search', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/search.html'));
});

//get member page
app.get('/student', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/student.html'));
});

//get member registration page
app.get('/registerStudent', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/registerStudent.html'));
});

//get partner page
app.get('/member', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/member.html'));
});

//get partner registration page
app.get('/registerMember', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/registerMember.html'));
});

//get about page
app.get('/about', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/about.html'));
});

// ==========================================================================
// REST API Endpints
// ==========================================================================


//post call to add Certificate on the network
app.post('/api/addCert', function (req, res) {

  //declare variables to retrieve from request
  var memberId = req.body.memberId;
  var cardId = req.body.cardId;
  var fileHash = req.body.fileHash;
  var fileName = req.body.fileName;
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;

  //print variables
  console.log('Using param - fileHash: ' + fileHash + ' fileName: ' + fileName + ' firstName: ' + firstName + ' lastName: ' + lastName + ' MemberId: ' + memberId + ' cardId: ' + cardId);

  if (fileHash == null && fileName == null) {
    res.json({
      error: response.error
    });
    return;
  } else {
    //Add Certificate data on the network
    network.storeCertificateData(cardId, memberId, fileHash, fileName, firstName, lastName)
      .then((response) => {
        //return error if error in response
        if (response.error != null) {
          res.json({
            error: response.error
          });
        } else {
          //else return success
          res.json({
            success: response
          });
        }
      }); //
  }

});

//post call to register member on the network
app.post('/api/registerMember', function (req, res) {

  //declare variables to retrieve from request
  var name = req.body.name;
  var partnerId = req.body.memberid;
  var cardId = req.body.cardid;

  //print variables
  console.log('Using param - name: ' + name + ' partnerId: ' + partnerId + ' cardId: ' + cardId);

  //validate partner registration fields
  validate.validateMemberRegistration(cardId, partnerId, name)
    .then((response) => {
      //return error if error in response
      if (response.error != null) {
        res.json({
          error: response.error
        });
        return;
      } else {
        //else register partner on the network
        network.registerMember(cardId, partnerId, name)
          .then((response) => {
            //return error if error in response
            if (response.error != null) {
              res.json({
                error: response.error
              });
            } else {
              //else return success
              console.log('Member Reg from app.js :: ' + response);
              res.json({
                success: response
              });
            }
          });
      }
    });

});

//post call to retrieve Student data, certificates data  from the network
app.post('/api/studentData', function (req, res) {

  //declare variables to retrieve from request
  var accountNumber = req.body.accountnumber;
  var cardId = req.body.cardid;

  //print variables
  console.log('studentData using param - ' + ' accountNumber: ' + accountNumber + ' cardId: ' + cardId);

  //declare return object
  var returnData = {};

  //get member data from network
  network.studentData(cardId, accountNumber)
    .then((member) => {
      //return error if error in response
      if (member.error != null) {
        res.json({
          error: member.error
        });
      } else {
        //else add member data to return object
        returnData.accountNumber = member.accountNumber;
        returnData.firstName = member.firstName;
        returnData.lastName = member.lastName;
      }

    })
    .then(() => {
      //get student certificate from the network
      network.allCertificates(cardId)
        .then((allCertificateResults) => {
          //return error if error in response
          if (allCertificateResults.error != null) {
            res.json({
              error: allCertificateResults.error
            });
          } else {
            //else add transaction data to return object
            returnData.allCertificateResults = allCertificateResults;
          }

        }).then(() => {
          //get partners to transact with from the network
          network.memberData(cardId)
            .then((memberInfo) => {
              //return error if error in response
              if (memberInfo.error != null) {
                res.json({
                  error: memberInfo.error
                });
              } else {
                //else add partners data to return object
                returnData.memberInfo = memberInfo;
              }

              //return returnData
              res.json(returnData);

            });
        });
    });

});

//post call to retrieve member data and transactions data from the network
app.post('/api/memberData', function (req, res) {

  //declare variables to retrieve from request
  var memberId = req.body.partnerid;
  var cardId = req.body.cardid;

  //print variables
  console.log('memberData using param - ' + ' memberId: ' + memberId + ' cardId: ' + cardId);

  //declare return object
  var returnData = {};

  //get partner data from network
  network.memberData(cardId, memberId)
    .then((member) => {
      //return error if error in response
      if (member.error != null) {
        res.json({
          error: member.error
        });
      } else {
        //else add partner data to return object
        returnData.id = member.memberId;
        returnData.name = member.name;
      }
      // res.json(returnData);
    })
    .then(() => {
      //get all certificates published by the Member on the network
      network.allCertificates(cardId, memberId)
        .then((allCertResults) => {
          //return error if error in response
          if (allCertResults.error != null) {
            res.json({
              error: allCertResults.error
            });
          } else {
            //else add certificates data to return object
            returnData.allCertResults = allCertResults;
          }
          //return returnData
          res.json(returnData);
          console.log(returnData);
        });
    });
  // });//////////////////////

});


//post call to retrieve certificate data and student data from the network
app.post('/api/certificate', function (req, res) {

  //declare variables to retrieve from request
  var fileHash = req.body.fileHash;

  //print variables
  console.log('Fetch Cert Data using param - ' + ' fileHash: ' + fileHash);

  //declare return object
  var returnData = {};

  //get partner data from network
  network.getCertificateData(fileHash)
    .then((cert) => {
      //return error if error in response
      if (cert.error != null) {
        res.json({
          error: cert.error
        });
      } else {
        //else add Certificate data to return object
        returnData.cert = cert;
      }
      res.json(returnData)
    })
});

//declare port
var port = process.env.PORT || 8001;
if (process.env.VCAP_APPLICATION) {
  port = process.env.PORT;
}

//run app on port
app.listen(port, function () {
  console.log('Blockchain API Server running on port: %d', port);
});