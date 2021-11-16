var mongoose = require('mongoose');

var AccountsSchema = new mongoose.Schema({
    userId: String,
    email: String,
    first_name: String,
    last_name: String,
    url: String,
    authData: {
        accessToken: String,
        refresh_token: String,
        token_type: String,
        expires_in: String
    },
    donationData: {
        donationAmount: String,
    }
});

var AccountsModel = mongoose.model('Account', AccountsSchema);
module.exports = AccountsModel;