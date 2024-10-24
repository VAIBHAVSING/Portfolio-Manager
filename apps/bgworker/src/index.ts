import redisPromise, { MyRedisClient } from "./controller";
import { PrismaClient } from "@prisma/client";

import nodemailer from 'nodemailer';

const sendEmail = async (to: string, subject: string, text: string) => {
    // Create a transporter object using your email service
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', // Replace with your SMTP server
        port: 587, // Replace with the appropriate port
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'algoxtrader123@gmail.com', // Replace with your email
            pass: 'fdkh chfr nczr ipcg', // Replace with your email password or app-specific password
        },
    });

    // Email options
    const mailOptions = {
        from: '"Your Name" <algoxtrader123@gmail.com>', // Sender address
        to, // Recipient address
        subject, // Subject line
        text, // Plain text body
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};



async function init() {
    const prisma = new PrismaClient()
    await redisPromise;
    while (true) {
        const resp = await MyRedisClient.getfromQueue();
        if (resp) {
            const id = resp.replace(/\\+/g, '').replace(/"/g, '');
            const alert = await prisma.alert.findUnique({
                where: { id },
                select: {
                    user: {
                        select: {
                            email: true,
                            telegramid: true,

                        }
                    },
                    alertName: true,
                    alertMethod: true,
                    conditionType: true,
                    targetValue: true,
                    asset: {
                        select: {
                            assetSymbol: true,
                            assetname: true,
                            assetType: true
                        }
                    },
                },
            });
            const message = `
        Alert Triggered: ${alert?.alertName}
        Asset: ${alert?.asset.assetname} (${alert?.asset.assetSymbol})
        Type: ${alert?.asset.assetType}
        Condition: ${alert?.conditionType}
        Target Value: ${alert?.targetValue}
        Alert Method: ${alert?.alertMethod}

        User Details:
        Email: ${alert?.user.email}
        Telegram ID: ${alert?.user.telegramid}
    `;
            if (alert?.alertMethod === "EMAIL") {
                sendEmail(alert.user.email, "Stock Price Crossed", message);
            }
            else if (alert?.alertMethod === 'TELEGRAM') {

            }
        } else {
            await setTimeout(() => {

            }, 1000);
        }
    }
}
init();
