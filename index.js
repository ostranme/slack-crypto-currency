'use strict';
require('dotenv').config()
var async = require('async');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

// Coinbase Credential and Node Client
var mykey = process.env.MY_KEY;
var mysecret = process.env.MY_SECRET;
var coinbase = require('coinbase');
var client   = new coinbase.Client({'apiKey': mykey, 'apiSecret': mysecret});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create local server and listen on port => 3000
var server = app.listen(3000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

app.get('/', (req, res) => {
  console.log(process.env.MY_KEY);

  res.send('App Works!');
  console.log('App Works!');
});

// HTTP POST route method to handle the command:
app.post('/', (req, res) => {
  var BTC_USD = null;
  var ETH_USD = null;
  var LTC_USD = null;

  var username =  res.req.body.user_name;
  var text = req.body.text;

  console.log('---');
  console.log('Username: ' + username + ' initiated a request.');
  console.log('---');

  if(text === 'help' || text === 'halp' || !text) {

    // Send response to slack channel for help
    var data = {
      response_type: 'in_channel', // public to the channel
      text: 'Crypto Nick uses <https://developers.coinbase.com/api/v2|Coinbase> to view crypto currency information. Use the Slash commands below to play along.',
      attachments: [
        {
            "title": "/crypto buy",
            "text": "Get the total price to buy each currency.",
            "color": "#222222"
        },
        {
            "title": "/crypto sell",
            "text": "Get the total price to sell each currency.",
            "color": "#222222"
        },
        {
            "title": "/crypto spot",
            "text": "Get the current market price for bitcoin.",
            "color": "#222222"
        }
        // {
        //     "title": "/crypto [BTC-USD, ETH-USD or LTC-USD] [YYYY-MM-DD]",
        //     "text": "Coinbase currenct pair with optional date for historic price",
        //     "color": "#222222"
        // }
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
        var data = {
          response_type: 'in_channel', // public to the channel
          text: 'BTC-USD: ' + '`$' + BTC_USD + '`' + '\n'  + 'ETH-USD: ' + '`$' + ETH_USD + '`' + '\n' + 'LTC-USD: ' + '`$' + LTC_USD + '`'
        };

        res.json(data);
        callback_step_4();
      },
    ]);
  }

  // IF SLASH CMD = BUY
  if(text === 'buy') {
    async.series([
      // GRAB BITCOIN SPOT PRICE
      function(callback_step_1) {
        console.log('---');
        console.log('STEP 1: BTC-USD');
        console.log('---');

        // Get the current BTC spot price
        client.getBuyPrice({'currencyPair': 'BTC-USD'}, function(err, obj) {
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
        client.getBuyPrice({'currencyPair': 'ETH-USD'}, function(err, obj) {
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
        var data = {
          response_type: 'in_channel', // public to the channel
          text: 'BTC-USD: ' + '`$' + BTC_USD + '`' + '\n'  + 'ETH-USD: ' + '`$' + ETH_USD + '`' + '\n' + 'LTC-USD: ' + '`$' + LTC_USD + '`'
        };

        res.json(data);
        callback_step_4();
      },
    ]);
  }

  // IF SLASH CMD = SELL
  if(text === 'sell') {
    async.series([
      // GRAB BITCOIN SPOT PRICE
      function(callback_step_1) {
        console.log('---');
        console.log('STEP 1: BTC-USD');
        console.log('---');

        // Get the current BTC spot price
        client.getSellPrice({'currencyPair': 'BTC-USD'}, function(err, obj) {
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
        client.getSellPrice({'currencyPair': 'ETH-USD'}, function(err, obj) {
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
        var data = {
          response_type: 'in_channel', // public to the channel
          text: 'BTC-USD: ' + '`$' + BTC_USD + '`' + '\n'  + 'ETH-USD: ' + '`$' + ETH_USD + '`' + '\n' + 'LTC-USD: ' + '`$' + LTC_USD + '`'
        };

        res.json(data);
        callback_step_4();
      },
    ]);
  }

  // SKETCH SHIT HAPPENING BELOW
  // https://github.com/coinbase/coinbase-node/issues/85

  // var stringArray = text.split(" ");
  // if(stringArray[0] === 'BTC-USD' || stringArray[0] === 'ETH-USD' || stringArray[0] === 'LTC-USD') {
  //   var date = stringArray[1];
  //   console.log(date);
  //   // Check date param is missing
  //   if (!stringArray[1]) {
  //     var data = {
  //       response_type: 'in_channel', // public to the channel
  //       text: 'YOU\'RE DOING IT WRONG!',
  //       attachments: [
  //         {
  //             "title": "/crypto [currencyPair] [YYYY-MM-DD]",
  //             "text": "Get the historic spot price to buy each currency.",
  //             "color": "#222222"
  //         }
  //       ]
  //     };
  //
  //     res.json(data);
  //   }
  //
  //   if(stringArray[0] === 'BTC-USD') {
  //     async.series([
  //       // GRAB BITCOIN SPOT PRICE
  //       function(callback_step_1) {
  //         console.log('---');
  //         console.log('STEP 1: BTC-USD');
  //         console.log('---');
  //
  //         // Get the current BTC spot price
  //         client.getSpotPrice({'currencyPair': 'BTC-USD?date=2017-01-01'}, function(err, obj) {
  //           console.log(obj);
  //           console.log('BTC total amount: ' + obj.data.amount);
  //           BTC_USD = obj.data.amount;
  //           callback_step_1();
  //         });
  //
  //       },
  //
  //       // SEND RESPONSE TO SLACK
  //       function(callback_step_2) {
  //         console.log('---');
  //         console.log('STEP 2: SLACK RESPONSE');
  //         console.log('---');
  //
  //         // Setup response to slack channel
  //         var data = {
  //           response_type: 'in_channel', // public to the channel
  //           text: 'BTC-USD: ' + '`$' + BTC_USD
  //         };
  //
  //         res.json(data);
  //         callback_step_2();
  //       },
  //     ]);
  //   }
  // }

});
