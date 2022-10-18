const express = require("express");
const app = express();
const port = 4000;
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const { uuid } = require("uuidv4");
const qs = require("qs");
var request = require("request");

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.post("/getInstallments", (req, res) => {
  console.log(req.body);
  const { merchant_id, customer_id, mobile_number, card_identifiers } =
    req.body;
  const { card_number, tokenAccountNumber, card_reference } =
    card_identifiers[0].card_number;
  res.json({
    order_amount: 10000,
    currency: "USD",
    eligible_plans: [
      {
        card_identifier: {
          card_number: card_number,
          tokenAccountNumber: tokenAccountNumber,
          card_reference: card_reference,
          paymentAccountReference: "ABCD",
        },
        payment_method: "CARD",
        payment_method_type: "VISA",
        issuer_name: "",
        juspay_bank_code: "JP_",
        merchant_Funded: {
          tenures: [
            {
              numberOfInstallments: 36,
              installmentFrequency: "MONTHLY",
              installmentProvider: "VISA/ MASTERCARD/ AFFIRM",
              installmentProviderName: "HK36M0450",
              installmentProviderID: "",
              installmentProviderIdRef: "",
              total_amount_payable: "25627.38",
              total_interest_amount: "504.13",
              total_upfront_interest_amount: "504.13",
              total_recurring_interest_amount: "504.13",
              total_monthly_amount_payable: "8542.46",
              bank_interest_rate: "12.00",
              additional_processing_fee: "0.00",
              termsAndConditions: [
                {
                  url: "",
                  text: "",
                  version: "",
                  languageCode: "",
                },
              ],
              installmentsInfo: {
                first_installment: {
                  amount_payable: "2093",
                  upfront_fee: 0,
                  interest_amount: 100,
                },
                last_installment: {
                  amount_payable: "2097",
                  upfront_fee: 0,
                  interest_amount: 50,
                },
              },
              metadata_VIS: {
                planType: "MARKET",
                feeType: "CONSUMER",
                promotionInfo: {},
              },
            },
          ],
        },
        consumer_Funded: {},
        bi_Lateral: {},
      },
    ],
  });
});
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/session", (req, res) => {
  const authorization = req.headers.authorization;
  console.log("request bodyP: ", req.body);

  const today = new Date();
  const encodedParams = {
    ...req.body,
    "options.get_client_auth_token": true,
  };
  req.body.merchant_id = req.headers["x-merchantid"];
  const body = req.body;
  const options = {
    method: "POST",
    url: "https://integ-expresscheckout-api.juspay.in/orders",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
      authorization: authorization,
      "x-merchant-id": req.headers["x-merchantid"],
      version: "2022-10-11",
    },
    data: encodedParams,
  };

  axios
    .request(options)
    .then(function (response) {
      const r = response.data;
      console.log("response from server", response.data);
      const sdk_payload = {
        requestId: uuid(),
        service: "com.juspay.gemi",
        payload: {
          clientId: body.payment_page_client_id,
          merchantId: r.merchant_id,
          apiAuthToken: authorization,
          clientAuthToken: r.juspay.client_auth_token,
          clientAuthTokenExpiry: r.juspay.client_auth_token_expiry,
          environment: "integ",
          action: body.action,
          customerId: r.customer_id,
          currency: r.currency,
          customerPhone: r.customer_phone,
          customerEmail: r.customer_email,
          orderId: r.order_id,
          address: body.address,
          timestamp: body.timestamp,
          firstName : body.first_name,
          lastName : body.last_name,
          returnUrl : body.return_url,
          amount: r.amount,
          cardNumber: body.cardNumber,
          orderDetails: JSON.stringify(body),
        },
      };
      res.json({ ...r, sdk_payload });
    })
    .catch(function (error) {
      console.error(error);
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
