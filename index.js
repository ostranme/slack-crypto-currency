'use strict';

require('dotenv').config()
const async = require('async');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Coinbase Node Client
const coinbase = require('coinbase');

// Coinbase `/prices` route is public. Setting key and secret required by node client
let coinbase_key = 'foo';
let coinbase_secret = 'bar';
let client = new coinbase.Client({'apiKey': coinbase_key, 'apiSecret': coinbase_secret});

// Create local server and listen on port => 3000
const server = app.listen(3000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

app.get('/', (req, res) => {
  if(req.query.token !== process.env.SLACK_VERIFICATION_TOKEN) {
    // the request is NOT coming from Slack!
    return;
  }
  res.send('App Works!');
});

// Temporary page to host slack button
app.get('/auth', (req, res) =>{
    res.sendFile(__dirname + '/add_to_slack.html')
})

// Redirect url for Auth
app.get('/slack', function(req, res){

  if (!req.query.code) {
    // access denied
    res.redirect('https://github.com/ostranme/slack-crypto-currency');
    return;
  }

  let data = {
    form: {
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code: req.query.code
    }
  };

  request.post('https://slack.com/api/oauth.access', data, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // done.

      // Grab team info, you need to get the token here
      let token = JSON.parse(body).access_token; // Auth token

      request.post('https://slack.com/api/team.info', {form: {token: token}},     function (error, response, body) {
        if (!error && response.statusCode == 200) {
          let team = JSON.parse(body).team.domain;
          res.redirect('http://' +team+ '.slack.com');
        }
      });
    }
  });
});

// HTTP POST route method to handle the command:
app.post('/command', (req, res) => {
  if(req.body.token !== process.env.SLACK_VERIFICATION_TOKEN) {
    // the request is NOT coming from Slack!
    console.log('the request is NOT coming from Slack!');
    return;
  }

  let BTC_USD = null;
  let ETH_USD = null;
  let LTC_USD = null;
  let text = req.body.text;

  if(text === 'help' || text === 'halp' || !text) {

    // Send response to slack channel for help
    let data = {
      response_type: 'ephemeral',
      text: 'CryptoNick uses <https://developers.coinbase.com/api/v2|Coinbase> API to view crypto currency information. Use the Slash commands below to play along.',
      attachments: [
        {
            "title": "/crypto buy",
            "text": "Get the total price to buy each currency.",
            "color": "#F35A00"
        },
        {
            "title": "/crypto sell",
            "text": "Get the total price to sell each currency.",
            "color": "#F35A00"
        },
        {
            "title": "/crypto spot",
            "text": "Get the current market price for bitcoin.",
            "color": "#F35A00"
        }
      ]
    };

    res.json(data);
  }

  // IF SLASH CMD = SPOT
  if(text === 'spot') {
    async.series([
      // GRAB BITCOIN SPOT PRICE
      function(callback_step_1) {
        console.log('---');
        console.log('STEP 1: BTC-USD');
        console.log('---');

        // Get the current BTC spot price
        client.getSpotPrice({'currencyPair': 'BTC-USD'}, function(err, obj) {
          console.log('BTC total amount: ' + obj.data.amount);
          BTC_USD = obj.data.amount;
          callback_step_1();
        });

      },
      // GRAB ETHEREUM SPOT PRICE
      function(callback_step_2) {
        console.log('---');
        console.log('STEP 2: ETH-USD');
        console.log('---');
        // Get the current ETH spot price
        client.getSpotPrice({'currencyPair': 'ETH-USD'}, function(err, obj) {
          console.log('ETH total amount: ' + obj.data.amount);
          ETH_USD = obj.data.amount;
          callback_step_2();
        });

      },
      // GRAB LITECOIN SPOT PRICE
      function(callback_step_3) {
        console.log('---');
        console.log('STEP 3: LTC-USD');
        console.log('---');

        // Get the current LTC spot price
        client.getSpotPrice({'currencyPair': 'LTC-USD'}, function(err, obj) {
          console.log('LTC total amount: ' + obj.data.amount);
          LTC_USD = obj.data.amount;
          callback_step_3();
        });

      },

      // SEND RESPONSE TO SLACK
      function(callback_step_4) {
        console.log('---');
        console.log('STEP 4: SLACK RESPONSE');
        console.log('---');

        // Setup response to slack channel
        let data = {
          response_type: 'ephemeral',
          text: 'The current market price for each currency...',
          attachments: [
            {
                "text": "*BTC-USD:* \t$" + BTC_USD,
                "color": "#F35A00",
    			      "mrkdwn_in": ["text"]
            },
    		    {
                "text": "*ETH-USD:* \t$" + ETH_USD,
                "color": "#F35A00",
    			      "mrkdwn_in": ["text"]
            },
    		    {
                "text": "*LTC-USD:*  \t$" + LTC_USD,
                "color": "#F35A00",
    			      "mrkdwn_in": ["text"]
            }
          ]
        };

        res.json(data);
        callback_step_4();
      },
    ]);
  }

  // IF SLASH CMD = BUY
  if(text === 'buy') {
    async.series([
      // GRAB BITCOIN BUY PRICE
      function(callback_step_1) {
        console.log('---');
        console.log('STEP 1: BTC-USD');
        console.log('---');

        // Get the current BTC buy price
        client.getBuyPrice({'currencyPair': 'BTC-USD'}, function(err, obj) {
          console.log('BTC total amount: ' + obj.data.amount);
          BTC_USD = obj.data.amount;
          callback_step_1();
        });

      },
      // GRAB ETHEREUM BUT PRICE
      function(callback_step_2) {
        console.log('---');
        console.log('STEP 2: ETH-USD');
        console.log('---');
        // Get the current ETH buy price
        client.getBuyPrice({'currencyPair': 'ETH-USD'}, function(err, obj) {
          console.log('ETH total amount: ' + obj.data.amount);
          ETH_USD = obj.data.amount;
          callback_step_2();
        });

      },
      // GRAB LITECOIN BUY PRICE
      function(callback_step_3) {
        console.log('---');
        console.log('STEP 3: LTC-USD');
        console.log('---');

        // Get the current LTC buy price
        client.getBuyPrice({'currencyPair': 'LTC-USD'}, function(err, obj) {
          console.log('LTC total amount: ' + obj.data.amount);
          LTC_USD = obj.data.amount;
          callback_step_3();
        });

      },

      // SEND RESPONSE TO SLACK
      function(callback_step_4) {
        console.log('---');
        console.log('STEP 4: SLACK RESPONSE');
        console.log('---');

        // Setup response to slack channel
        let data = {
          response_type: 'ephemeral',
          text: 'The total price to buy each currency...',
          attachments: [
            {
                "text": "*BTC-USD:* \t$" + BTC_USD,
                "color": "#F35A00",
    			      "mrkdwn_in": ["text"]
            },
    		    {
                "text": "*ETH-USD:* \t$" + ETH_USD,
                "color": "#F35A00",
    			      "mrkdwn_in": ["text"]
            },
    		    {
                "text": "*LTC-USD:*  \t$" + LTC_USD,
                "color": "#F35A00",
    			      "mrkdwn_in": ["text"]
            }
          ]
        };

        res.json(data);
        callback_step_4();
      },
    ]);
  }

  // IF SLASH CMD = SELL
  if(text === 'sell') {
    async.series([
      // GRAB BITCOIN SELL PRICE
      function(callback_step_1) {
        console.log('---');
        console.log('STEP 1: BTC-USD');
        console.log('---');

        // Get the current BTC sell price
        client.getSellPrice({'currencyPair': 'BTC-USD'}, function(err, obj) {
          console.log('BTC total amount: ' + obj.data.amount);
          BTC_USD = obj.data.amount;
          callback_step_1();
        });

      },
      // GRAB ETHEREUM SELL PRICE
      function(callback_step_2) {
        console.log('---');
        console.log('STEP 2: ETH-USD');
        console.log('---');
        // Get the current ETH sell price
        client.getSellPrice({'currencyPair': 'ETH-USD'}, function(err, obj) {
          console.log('ETH total amount: ' + obj.data.amount);
          ETH_USD = obj.data.amount;
          callback_step_2();
        });

      },
      // GRAB LITECOIN SELL PRICE
      function(callback_step_3) {
        console.log('---');
        console.log('STEP 3: LTC-USD');
        console.log('---');

        // Get the current LTC sell price
        client.getSellPrice({'currencyPair': 'LTC-USD'}, function(err, obj) {
          console.log('LTC total amount: ' + obj.data.amount);
          LTC_USD = obj.data.amount;
          callback_step_3();
        });

      },

      // SEND RESPONSE TO SLACK
      function(callback_step_4) {
        console.log('---');
        console.log('STEP 4: SLACK RESPONSE');
        console.log('---');

        // Setup response to slack channel
        let data = {
          response_type: 'ephemeral',
          text: 'The total price to sell each currency....',
          attachments: [
            {
                "text": "*BTC-USD:* \t$" + BTC_USD,
                "color": "#F35A00",
    			      "mrkdwn_in": ["text"]
            },
    		    {
                "text": "*ETH-USD:* \t$" + ETH_USD,
                "color": "#F35A00",
    			      "mrkdwn_in": ["text"]
            },
    		    {
                "text": "*LTC-USD:*  \t$" + LTC_USD,
                "color": "#F35A00",
    			      "mrkdwn_in": ["text"]
            }
          ]
        };

        res.json(data);
        callback_step_4();
      },
    ]);
  }

});
