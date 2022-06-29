const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");
const pug = require("pug");
const _ = require("lodash");
const path = require("path");

const { donor, Donor } = require("./models/Donor");
const { response } = require("express");
const { initializePayment, verifyPayment } =
  require("./config/paystack")(request);

const port = process.env.port || 3000;
const app = express();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(express.static(path.join(__dirname, "public/")));
app.set("view engine", pug);

app.get("/", (req, res) => {
  res.render("index.pug");
});

app.post("/paystack/pay", (req, res) => {
  const form = _.pick(req.body, ["amount", "email", "fullName"]);
  form.metadata = {
    fullName: form.fullName,
  };
  form.amount *= 100;

  initializePayment(form, (error, body) => {
    if (error) {
      console.log(error);
      return;
    }
    response = JSON.parse(body);
    res.redirect(response.data.authorization_url);
  });
});

app.get("/paystack/callback", (req, res) => {
  const ref = req.query.reference;
  verifyPayment(ref, (error, body) => {
    if (error) {
      console.log(error);
      return res.redirect("/error");
    }
    response = JSON.parse(body);
    const data = _.at(response.data, [
      "reference",
      "amount",
      "customer.email",
      "metadata.fullName",
    ]);

    [reference, amount, email, fullName] = data;
    newDonor = {
      reference,
      amount,
      email,
      fullName,
    };

    donor
      .save()
      .then((donor) => {
        if (!donor) {
          res.redirect("/error");
        }
        res.redirect("/receipt/" + donor._id);
      })
      .catch((e) => {
        res.redirect("/error");
      });
  });
});

app.get("/receipt/:id", (req, res) => {
  const id = req.params.id;
  Donor.findById(id)
    .then((donor) => {
      if (!donor) {
        res.redirect("/error");
      }
      res.sender("success.pug", { donor });
    })
    .catch((e) => {
      res.redirect("/error");
    });
});

app.get("/error", (req, res) => {
  res.render("error.pug");
});

// app.get("/paystack/callback", (req, res) => {
//   const ref = req.query.reference;
//   verifyPayment(ref, (error, body) => {
//     if (error) {
//       console.log(error);
//       return res.redirect("/error");
//     }
//     response = JSON.parse(body);
//     const data = _.at(response.data, [
//       "reference",
//       "amount",
//       "customer.email",
//       "metadata.fullName",
//     ]);

//     [reference, amount, email, fullName] = data;
//     newDonor = {
//       reference,
//       amount,
//       email,
//       fullName,
//     };
//   });
// });

app.listen(port, () => {
  console.log(`Server running at port : ${port}`);
});
