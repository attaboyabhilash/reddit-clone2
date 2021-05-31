import nodemailer from "nodemailer";

const sendEmail = async(to: string, html: string) => {
  
  //const testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: 'dnptyqitfjxv7eio@ethereal.email',
      pass: 'AKv4dAGjZu1Wynpheq',
    },
  });

  let info = await transporter.sendMail({
    from: '"Abhilash Negi" <tiger@attaboyabhilash.com>',
    to: to,
    subject: "Forget Password | Reddit Clone",
    html: html
  });

  console.log("Message sent:", info.messageId);
  console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  
}

export default sendEmail 

