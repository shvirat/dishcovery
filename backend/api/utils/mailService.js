    const nodemailer = require("nodemailer");
    /**
     * Send an email using Nodemailer
     * @param {Object} options - Email options
     */
    const sendEmail = async (options) => {
        try {
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            const mailOptions = {
                from: `Dishcovery <${process.env.SMTP_USER}>`,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
            };

            const info = await transporter.sendMail(mailOptions);
            console.log("Email sent: %s", info.messageId);
            return info;
        } catch (error) {
            console.error("Error sending email:", error);
            throw error;
        }
    };

    module.exports = sendEmail;
