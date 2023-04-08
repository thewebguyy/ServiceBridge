// get form element
const paymentForm = document.getElementById("payment-form");

// add submit event listener
paymentForm.addEventListener("submit", (e) => {
  // prevent form submission
  e.preventDefault();

  // get input values
  const amount = document.getElementById("amount").value;
  const accountNumber = "8250560854";
  const accountName = "ServiceBridge";
  const bankName = "Moniepoint";

  // display payment details to user
  const paymentDetails = `
    <h3>Please make a transfer of ${amount} Naira to the following account:</h3>
    <p>Account Number: ${accountNumber}</p>
    <p>Account Name: ${accountName}</p>
    <p>Bank Name: ${bankName}</p>
  `;
  document.getElementById("payment-details").innerHTML = paymentDetails;
});
