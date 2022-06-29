const paystack = (request) => {
  const MySecretKey = "sk_test_c279861b62c0a7dd225fca49ba85299b342de699";

  const initializePayment = (form, mycallback) => {
    const option = {
      url: "https://api.paystack.co/transaction/initialize",
      headers: {
        authorization: MySecretKey,
        "content-type": "application/json",
        "cache-control": "no-cache",
      },
      form,
    };
    const callback = (error, response, body) => {
      return mycallback(error, body);
    };
    request.post(option, callback);
  };

  const verifyPayment = (ref, mycallback) => {
    const option = {
      url:
        "https://api.paystack.co/transaction/verify/" + encodeURIComponent(ref),
      headers: {
        authorization: MySecretKey,
        "content-type": "application/json",
        "cache-control": "no-cache",
      },
    };

    const callback = (error, response, body) => {
      return mycallback(error, body);
    };
    return option, callback;
  };
  return { initializePayment, verifyPayment };
};

module.exports = paystack;
