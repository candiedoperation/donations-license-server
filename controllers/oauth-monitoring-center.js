var axios = require('axios');
var AccountsModel = require('../public/models/accounts.model');
var productionSecrets = require('../public/models/secrets.data');

const mc_oauth_router = (req, res) => {
  axios.post(
    `https://www.patreon.com/api/oauth2/token?code=${req.query.code}&grant_type=authorization_code&client_id=${productionSecrets.monitoringCenter.client_id}&client_secret=${productionSecrets.monitoringCenter.client_secret}&redirect_uri=${productionSecrets.monitoringCenter.redirect_url}`
  ).then((token_response) => {
    axios.get("https://www.patreon.com/api/oauth2/v2/identity?fields%5Buser%5D=email,first_name,last_name,url", {
      headers: { Authorization: `Bearer ${token_response.data.access_token}` }
    }).then((user_response) => {
      AccountsModel
        .find()
        .where('userId').equals(user_response.data.data.id)
        .count()
        .exec((error, matchCount) => {
          if (error) res.status(500).send("Internal Server Error")
          if (matchCount == null || matchCount == 0) {
            var newAccountInstance = new AccountsModel({
              userId: user_response.data.data.id,
              email: user_response.data.data.attributes.email,
              first_name: user_response.data.data.attributes.first_name,
              last_name: user_response.data.data.attributes.last_name,
              url: user_response.data.data.attributes.url,
              authData: {
                accessToken: token_response.data.access_token,
                refresh_token: token_response.data.refresh_token,
                token_type: token_response.data.token_type,
                expires_in: token_response.data.expires_in
              },
              licenseData: [{
                appName: "monitoring-center",
                donated: false,
                devices: []
              }]
            });

            newAccountInstance.save((err) => {
              if (err) res.status(500).send("Error Saving to Database");
              res.redirect(`${productionSecrets.monitoringCenter.client_schemeURL}?userId=${encodeURIComponent(user_response.data.data.id)}&firstName=${encodeURIComponent(user_response.data.data.attributes.first_name)}&lastName=${encodeURIComponent(user_response.data.data.attributes.last_name)}&email=${encodeURIComponent(user_response.data.data.attributes.email)}`)
            })
          } else {
            AccountsModel
              .findOneAndUpdate({ userId: user_response.data.data.id }, {
                authData: {
                  accessToken: token_response.data.access_token,
                  refresh_token: token_response.data.refresh_token,
                  token_type: token_response.data.token_type,
                  expires_in: token_response.data.expires_in
                }
              }, { new: true }, (error, updatedDocument) => {
                if (error) res.status(500).send("Unable to Update Database");
                res.redirect(`${productionSecrets.monitoringCenter.client_schemeURL}?userId=${encodeURIComponent(updatedDocument.userId)}&firstName=${encodeURIComponent(updatedDocument.first_name)}&lastName=${encodeURIComponent(updatedDocument.last_name)}&email=${encodeURIComponent(updatedDocument.email)}`)
              });
          }
        })
    }).catch((error) => {
      res.status(500).send(error);
    })
  }).catch((error) => {
    res.status(500).send(error)
  })
};

const getLicenseStatus = (req, res) => {
  if (req.body.userId) {
    AccountsModel
      .find()
      .where('userId').equals(req.body.userId)
      .select('licenseData -_id')
      .exec((error, licenseStatus) => {
        if (error) res.status(500).send("Failed to Fetch License Information from Server")
        if (licenseStatus.length === 0) res.status(400).send("Account Not Found");

        /**
         * Donation Level 0 -> Tier 0
         * Donation Level 1 -> Tier 1
         * ... and so on
         */

        res.status(200).send({ dLevel: 2 })
      });
  } else {
    res.status(400).send("e-Mail Field is Empty")
  }
}

module.exports = { mc_oauth_router, getLicenseStatus };
