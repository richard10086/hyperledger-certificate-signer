'use strict';

/* global getParticipantRegistry emit */


// --------------------------

/**
 * Certificate Transfer transaction
 * @param {org.certsigner.zak.CertTransfer} transfer
 * @transaction
 */
async function transferCertificate(transfer) {
  transfer.cert.owner = transfer.newOwner;
  return getAssetRegistry("org.certsigner.zak.CertFile")
    .then(assetRegistry => {
      return assetRegistry.update(transfer.cert); // Update the network registry
    })
    .then(() => {
      let event = getFactory().newEvent(
        "org.certsigner.zak",
        "CertTransferNotification"
      ); // Get a reference to the event specified in the modeling language
      event.cert = transfer.cert;
      emit(event); // Fire off the event
    });
}