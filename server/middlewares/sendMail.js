/**
 * @fileoverview Email Service Middleware
 * Implements email sending functionality for OTP verification and certification
 * @requires nodemailer
 */

import { createTransport } from "nodemailer";

/**
 * Sends OTP verification email to user
 * @async
 * @function sendMail
 * @param {string} email - Recipient's email address
 * @param {string} subject - Email subject
 * @param {Object} data - Email data
 * @param {string} data.name - Recipient's name
 * @param {string} data.otp - One-Time Password
 * @returns {Promise<void>}
 */
export const sendMail = async (email, subject, data) => {
    const transporter = createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        }
    })

    const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }
            .container {
                background-color: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                text-align: center;
            }
            h1 { color: red; }
            p {
                margin-bottom: 20px;
                color: #666;
            }
            .otp {
                font-size: 36px;
                color: #7b68ee;
                margin-bottom: 30px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>OTP Verification</h1>
            <p>Hello ${data.name} your (One-Time Password) for your account verification is.</p>
            <p class="otp">${data.otp}</p> 
        </div>
    </body>
    </html>`;
    
    await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: subject,
        html: html,
    })
}

/**
 * Sends certification completion email to user
 * @async
 * @function sendCertificationMail
 * @param {string} email - Recipient's email address
 * @param {string} subject - Email subject
 * @param {Object} data - Email data
 * @param {string} data.name - Recipient's name
 * @param {string} data.course - Course name
 * @param {string} data.certificateId - Certificate ID
 * @returns {Promise<void>}
 */
export const sendCertificationMail = async (email, subject, data) => {
    const transporter = createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        }
    })

    const html = `<!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Félicitations pour votre Certification !</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background-color: #f9f9f9;
            }
            .container {
                background-color: #fff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                text-align: center;
                max-width: 500px;
                margin: auto;
            }
            h1 { color: #4CAF50; }
            p {
                color: #555;
                margin-bottom: 15px;
            }
            .name {
                font-weight: bold;
                color: #333;
            }
            .certificate {
                font-size: 20px;
                color: #7b68ee;
                margin: 20px 0;
            }
            .footer {
                margin-top: 30px;
                font-size: 12px;
                color: #aaa;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Félicitations !</h1>
            <p>Cher(ère) <span class="name">${data.name}</span>,</p>
            <p>Nous avons le plaisir de vous informer que vous avez brillamment complété le programme <strong>${data.course}</strong> et obtenu votre certification. Votre travail acharné et votre engagement ont porté leurs fruits !</p>
            <p class="certificate">ID de Certification : ${data.certificateId}</p>
            <p>Nous vous souhaitons beaucoup de succès dans vos projets futurs. Continuez à viser l'excellence !</p>
            <div class="footer">
                Cordialement,<br>
                L'équipe Knowledge Learning
            </div>
        </div>
    </body>
    </html>`;
    
    await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: subject,
        html: html,
    })
}

