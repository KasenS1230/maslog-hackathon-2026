require('dotenv').config();
console.log("Using key:", process.env.myapikey); // Should show your SG key

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.myapikey);

const msg = {
  to: 'daejoi55@gmail.com',
  from: 'daejoi55@gmail.com', // Must be verified in SendGrid Dashboard
  subject: 'Test Notification',
  text: 'This is your email notification body.',
  html: '<strong>This is your email notification body.</strong>',
};

sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent successfully!');
  })
  .catch((error) => {
    console.error('Error details:', error.response.body); // This shows the specific SendGrid error
  });