const sgMail = require('@sendgrid/mail');

sgMail.setApiKey('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');
const msg = {
  to: 'andrew.wams@gmail.com',					//receiver's email
  from: 'andrew.wams@yahoo.com',			//sender's email
  subject: 'I think its working',				//Subject
  text: 'and finally  i can send email from sendgrid',		//content
  html: 'and easy to do anywhere, even with Node.js',			//HTML content
};
sgMail.send(msg);
						