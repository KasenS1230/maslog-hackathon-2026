const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.Stag5lnLxkFcWJoBhH2Fb3RvUa0SVUat);

const msg = {
  to: 'daejoi55@gmail.com',
  from: 'daejoi55@gmail.com', // Must be verified
  subject: 'Test',
  text: 'This is your email notification body.',
  html: '<strong>This is your email notification body.</strong>',
};

sgMail.send(msg);