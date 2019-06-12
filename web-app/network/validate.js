module.exports = {

  /*
  * Validata member registration fields ensuring the fields meet the criteria
  * @param {String} cardId
  * @param {String} accountNumber
  * @param {String} firstName
  * @param {String} lastName
  */
  validateStudentRegistration: async function(cardId, accountNumber, firstName, lastName) {

    var response = {};

    //verify input otherwise return error with an informative message
    if (accountNumber.length < 4) {
      response.error = "Account number must be at least six digits long";
      console.log(response.error);
      return response;
    } else if (!/^[0-9a-zA-Z]+$/.test(accountNumber)) {
      response.error = "Account number must be valid characters";
      console.log(response.error);
      return response;
    } else if (accountNumber.length > 25) {
      response.error = "Account number must be less than 25 digits";
      console.log(response.error);
      return response;
    } else if (cardId.length < 1) {
      response.error = "Enter access key";
      console.log(response.error);
      return response;
    } else if (!/^[0-9a-zA-Z]+$/.test(cardId)) {
      response.error = "Card id can be letters and numbers only";
      console.log(response.error);
      return response;
    } else if (firstName.length < 1) {
      response.error = "Enter first name";
      console.log(response.error);
      return response;
    } else if (!/^[a-zA-Z]+$/.test(firstName)) {
      response.error = "First name must be letters only";
      console.log(response.error);
      return response;
    } else if (lastName.length < 1) {
      response.error = "Enter last name";
      console.log(response.error);
      return response;
    } else if (!/^[a-zA-Z]+$/.test(lastName)) {
      response.error = "First name must be letters only";
      console.log(response.error);
      return response;
    } else {
      console.log("Valid Entries");
      return response;
    }

  },

  /*
  * Validata University/Institution registration fields ensuring the fields meet the criteria
  * @param {String} cardId
  * @param {String} memberId
  * @param {String} name
  */
  validateMemberRegistration: async function(cardId, memberId, name) {

    var response = {};

    //verify input otherwise return error with an informative message
    if (cardId.length < 1) {
      response.error = "Enter access key";
      console.log(response.error);
      return response;
    } else if (!/^[0-9a-zA-Z]+$/.test(cardId)) {
      response.error = "Access key can be letters and numbers only";
      console.log(response.error);
      return response;
    } else if (memberId.length < 1) {
      response.error = "Enter University/Institution id";
      console.log(response.error);
      return response;
    } else if (!/^[0-9a-zA-Z]+$/.test(memberId)) {
      response.error = "University/Institution id can be letters and numbers only";
      console.log(response.error);
      return response;
    } else if (name.length < 1) {
      response.error = "Enter University/Institution name";
      console.log(response.error);
      return response;
    } else if (!/^\w+( \w+)*$/.test(name)) {
      response.error = "University/Institution name must be letters only";
      console.log(response.error);
      return response;
    } else {
      console.log("Valid Entries");
      return response;
    }

  },

  validatePoints: async function(points) {

    //verify input otherwise return error with an informative message
    if (isNaN(points)) {
      response.error = "Points must be number";
      console.log(response.error);
      return response;
    } else {
      return Math.round(points);
    }

  }

}


//stackoverflow
function isInt(value) {
  return !isNaN(value) && (function(x) {
    return (x | 0) === x;
  })(parseFloat(value))
}

//stackoverflow
function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

//stackoverflow
function validatePhoneNumber(phoneNumber) {
  var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return re.test(String(phoneNumber));
}
