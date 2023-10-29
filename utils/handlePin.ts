import { transporter } from '../config/nodemailer';

const APP_NAME = process.env.APP_NAME;

export const activationPin = (): number =>{

  const min = 100000;
  const max = 999999;

  const random = Math.floor(Math.random() * (max - min + 1) ) + min;
  return random;

}

export const sendActivationPin = async (email: string, name: string, pin: number) => {

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <title>Verificación de cuenta - Código de confirmación</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f5f5f5;
          }
  
          .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 5px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
  
          h1 {
              color: #333333;
              font-size: 24px;
          }
  
          p {
              color: #555555;
              font-size: 16px;
              margin-bottom: 20px;
          }
  
          .verification-code {
              padding: 10px;
              background-color: #eeeeee;
              border-radius: 5px;
              font-size: 18px;
          }
  
          .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #3498db;
              color: #ffffff;
              text-decoration: none;
              border-radius: 5px;
              font-size: 16px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <h1>Verificación de cuenta - Código de confirmación</h1>
          <p>Estimado(a) ${name},</p>
          <p>Gracias por registrarte en ${APP_NAME}. Para asegurarnos de que tu cuenta sea válida y proteger la seguridad de nuestros usuarios, requerimos que completes el proceso de verificación. A continuación, encontrarás un código de confirmación que deberás ingresar en nuestro sitio web para activar tu cuenta.</p>
          <p>Código de confirmación: <span class="verification-code">${pin}</span></p>
          <p>Por favor, sigue los pasos a continuación para completar la verificación:</p>
          <ol>
              <li>Visita nuestro sitio web: <a href="${process.env.BASE_URL}">${APP_NAME}</a></li>
              <li>Haz clic en "Iniciar sesión" en la esquina superior derecha.</li>
              <li>Ingrese sus datos de inicio de sesión y selecciona la opción "Activar cuenta".</li>
              <li>Ingresa el código de confirmación proporcionado anteriormente.</li>
              <li>Haz clic en "ACTIVAR" para finalizar el proceso de verificación.</li>
          </ol>
          <p>Recuerda que este código de confirmación es válido por un tiempo limitado. Si no lo ingresas antes de que expire, deberás solicitar otro código de confirmación.</p>
          <p>Si tienes alguna pregunta o necesitas asistencia adicional, no dudes en contactarnos. Estamos aquí para ayudarte.</p>
          <p>¡Gracias por elegir a ${APP_NAME}!</p>
          <p>Atentamente,<br>${APP_NAME}<br>Equipo de Soporte al Cliente</p>
      </div>
  </body>
  </html>
  `

  const mailOptions = {
    from: `${process.env.MAIL_SMTP_FROM}`,
    to: email,
    subject: `Activate NodeShop account`,
    html: html
  }

  await transporter.sendMail(mailOptions);

}
