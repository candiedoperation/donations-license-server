var axios = require('axios');
var express = require('express');
var router = express.Router();
const mc_oauth_router = require('../controllers/oauth-monitoring-center');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/oauth/monitoring-center', mc_oauth_router.mc_oauth_router);
router.post('/oauth/monitoring-center/license-status', mc_oauth_router.getLicenseStatus);

module.exports = router;
