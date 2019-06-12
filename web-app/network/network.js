const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const {
  BusinessNetworkDefinition,
  CertificateUtil,
  IdCard
} = require('composer-common');

//declate namespace
const namespace = 'org.certsigner.zak';

//in-memory card store for testing so cards are not persisted to the file system
const cardStore = require('composer-common').NetworkCardStoreManager.getCardStore({
  type: 'composer-wallet-inmemory'
});

//admin connection to the blockchain, used to deploy the business network
let adminConnection;

//this is the business network connection the tests will use.
let businessNetworkConnection;

let businessNetworkName = 'certificate-signing-network';
let factory;


/*
 * Import card for an identity
 * @param {String} cardName The card name to use for this identity
 * @param {Object} identity The identity details
 */
async function importCardForIdentity(cardName, identity) {

  //use admin connection
  adminConnection = new AdminConnection();
  businessNetworkName = 'certificate-signing-network';

  //declare metadata
  const metadata = {
    userName: identity.userID,
    version: 1,
    enrollmentSecret: identity.userSecret,
    businessNetwork: businessNetworkName
  };

  //get connectionProfile from json, create Idcard
  const connectionProfile = require('./local_connection.json');
  const card = new IdCard(metadata, connectionProfile);

  //import card
  await adminConnection.importCard(cardName, card);
}


/*
 * Reconnect using a different identity
 * @param {String} cardName The identity to use
 */
async function useIdentity(cardName) {

  //disconnect existing connection
  await businessNetworkConnection.disconnect();

  //connect to network using cardName
  businessNetworkConnection = new BusinessNetworkConnection();
  await businessNetworkConnection.connect(cardName);
}


//export module
module.exports = {

  /*
   * Create Member participant and import card for identity
   * @param {String} cardId Import card id for member
   * @param {String} accountNumber Member account number as identifier on network
   * @param {String} name Member Name
   */
  registerMember: async function (cardId, memberId, name) {
    try {

      //connect as admin
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect('admin@certificate-signing-network');

      //get the factory for the business network
      factory = businessNetworkConnection.getBusinessNetwork().getFactory();

      //create member participant
      const member = factory.newResource(namespace, 'Member', memberId);
      member.name = name;

      //add member participant
      const participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Member');
      await participantRegistry.add(member);

      //issue identity
      const identity = await businessNetworkConnection.issueIdentity(namespace + '.Member#' + memberId, cardId);

      //import card for identity
      await importCardForIdentity(cardId, identity);

      //disconnect
      await businessNetworkConnection.disconnect('admin@certificate-signing-network');

      return true;
    } catch (err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

  },


  /*
   * Create A Student 
   * @param {String} cardId Import card id for member
   * @param {String} accountNumber Member account number as identifier on network
   * @param {String} firstName Member first name
   * @param {String} lastName Member last name
   */
  registerStudent: async function (cardId, memberId, firstName, lastName) {
    try {

      //connect as admin
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //get the factory for the business network
      factory = businessNetworkConnection.getBusinessNetwork().getFactory();

       // Generate a random number as ID for the File
       let studentId =  `${Math.floor(Math.random() * 10000)}`;

      //create member student
      const student = factory.newResource(namespace, 'Student', studentId);
      student.firstName = firstName;
      student.lastName = lastName;

      //add member student
      const participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Student');

      let ownerRelationship = factory.newRelationship(namespace, 'Member', memberId)
      student.owner = ownerRelationship

      await participantRegistry.add(student);

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      return true;
    } catch (err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

  },


  /*
   * Store a Certificate 
   * @param {String} cardId Import card id for member
   * @param {String} memberId Member memberId as identifier on network
   * @param {String} fileHash Certificate hash code
   * @param {String} fileName Certificate name on IPFS
   */
  storeCertificateData: async function (cardId, memberId, fileHash, fileName, firstName, lastName) {
    try {

      //connect as admin
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //get the factory for the business network
      factory = businessNetworkConnection.getBusinessNetwork().getFactory();

      // Generate a random number as ID for the File
      // let fileId =  `${Math.floor(Math.random() * 10000)}`;
      
      //create member student
      const fileData = factory.newResource(namespace, 'CertFile', fileHash);
      fileData.fileHash = fileHash;
      fileData.fileName = fileName;
      fileData.firstName = firstName;
      fileData.lastName = lastName;
      // fileData.fileId = fileId; //file ID not needed

      //Get Certificate Registry
      const assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.CertFile');

      //Set relationship of Certificate to Member
      let ownerRelationship = factory.newRelationship(namespace, 'Member', memberId)
      fileData.owner = ownerRelationship

      //Now Add Certificate
      await assetRegistry.add(fileData);

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      return true;
    } catch (err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

  },

  /*
   * Get Member data
   * @param {String} cardId Card id to connect to network
   * @param {String} memberId of member
   */
  memberData: async function (cardId, memberId) {

    try {

      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //get member from the network
      const memberRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Member');
      const member = await memberRegistry.get(memberId);

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return member object
      // console.log(member);
      return member;
    } catch (err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

  },

  /*
   * Get Student data
   * @param {String} cardId Card id to connect to network
   * @param {String} studentId Student Id of student
   */
  studentData: async function (cardId, studentId) {

    try {

      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //get member from the network
      const assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Student');
      const student = await assetRegistry.get(studentId);

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return partner object
      return student;
    } catch (err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error
    }

  },


  /*
   * Get Certicate data
   * @param {String} studentId Student Id of student
   */
  getCertificateData: async function (fileHash) {

    try {

      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect('admin@certificate-signing-network');

      //get member from the network
      const assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.CertFile');
      const certificate = await assetRegistry.get(fileHash);

      //disconnect
      await businessNetworkConnection.disconnect('admin@certificate-signing-network');

      //return partner object
      return certificate;
    } catch (err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error
    }

  },

  /*
   * Get all partners data
   * @param {String} cardId Card id to connect to network
   */
  allMembersInfo: async function (cardId) {

    try {
      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //query all partners from the network
      const allPartners = await businessNetworkConnection.query('selectMembers');

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return allPartners object
      return allPartners;
    } catch (err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error
    }
  },

  /*
   * Get all Students data
   * @param {String} cardId Card id to connect to network
   */
  allStudents: async function (cardId, memberId) {

    try {
      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //query EarnPoints transactions on the network
      const allStudentResults = await businessNetworkConnection.query('selectStudents', {owner: `resource:${namespace}.Member#${memberId}`});

      // console.log(allStudentResults)

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return earnPointsResults object
      return allStudentResults;
    } catch (err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error
    }

  },

  /*
   * Get all Certificate data
   * @param {String} cardId Card id to connect to network
   */
  allCertificates: async function (cardId, memberId) {

    try {
      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //query UsePoints transactions on the network
      const certificateResults = await businessNetworkConnection.query('selectCertificates', {owner: `resource:${namespace}.Member#${memberId}`});

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return usePointsResults object
      return certificateResults;
    } catch (err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error
    }

  }

}