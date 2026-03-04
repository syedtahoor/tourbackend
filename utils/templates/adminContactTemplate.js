// utils/templates/adminContactTemplate.js

const adminContactTemplate = ({
    fullName,
    emailAddress,
    phoneNumber,
    subject,
    message
}) => {
    return `
        <div style="font-family: Arial, sans-serif; padding: 40px 20px; background: linear-gradient(135deg, #e0f7f7 0%, #f0fafa 100%); min-height: 100vh;">
            <div style="max-width: 620px; margin: auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,180,180,0.10);">

                <!-- Header -->
                <div style="background: linear-gradient(135deg, #007a7a 0%, #004f4f 100%); padding: 28px 32px; display: flex; align-items: center;">
                    <div>
                        <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">New Contact Query Received</h1>
                        <p style="margin: 4px 0 0; color: rgba(255,255,255,0.70); font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase;">SmartTour Admin Notification</p>
                    </div>
                </div>

                <!-- Alert Badge -->
                <div style="background: #fff8e1; border-left: 4px solid #f59e0b; padding: 12px 24px; font-size: 13px; color: #92680a; font-family: Arial, sans-serif;">
                    ⚠️ &nbsp;Action required — A new visitor has submitted a contact form.
                </div>

                <!-- Body -->
                <div style="padding: 32px 36px 24px;">

                    <h3 style="color: #007a7a; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 20px; font-family: Arial, sans-serif;">
                        📋 Sender Details
                    </h3>

                    <!-- Info Table -->
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px; font-family: Arial, sans-serif;">
                        <tr style="background: #f0ffff;">
                            <td style="padding: 12px 16px; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1px; width: 30%; border-bottom: 1px solid #e0f7f7;">👤 Name</td>
                            <td style="padding: 12px 16px; font-size: 15px; color: #1a1a1a; font-weight: 600; border-bottom: 1px solid #e0f7f7;">${fullName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 16px; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e0f7f7;">📧 Email</td>
                            <td style="padding: 12px 16px; font-size: 15px; border-bottom: 1px solid #e0f7f7;">
                                <a href="mailto:${emailAddress}" style="color: #0abfbf; text-decoration: none;">${emailAddress}</a>
                            </td>
                        </tr>
                        <tr style="background: #f0ffff;">
                            <td style="padding: 12px 16px; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e0f7f7;">📞 Phone</td>
                            <td style="padding: 12px 16px; font-size: 15px; color: #1a1a1a; border-bottom: 1px solid #e0f7f7;">
                                <a href="tel:${phoneNumber}" style="color: #0abfbf; text-decoration: none;">${phoneNumber}</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 16px; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1px;">📌 Subject</td>
                            <td style="padding: 12px 16px; font-size: 15px; color: #1a1a1a; font-weight: 600;">${subject}</td>
                        </tr>
                    </table>

                    <!-- Message -->
                    <h3 style="color: #007a7a; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px; font-family: Arial, sans-serif;">
                        💬 Message
                    </h3>
                    <div style="background: linear-gradient(135deg, #f0ffff, #e6fafa); border-left: 4px solid #0abfbf; border-radius: 0 8px 8px 0; padding: 18px 20px; font-size: 15px; color: #333; line-height: 1.7; font-family: Arial, sans-serif; margin-bottom: 28px;">
                        ${message}
                    </div>

                    <!-- CTA Buttons -->
                    <div style="text-align: center; margin-bottom: 8px;">
                        <a href="mailto:${emailAddress}" style="display: inline-block; background: linear-gradient(135deg, #0abfbf, #007a7a); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 50px; font-size: 14px; font-weight: 600; font-family: Arial, sans-serif; margin: 0 6px;">
                            ✉️ Reply to ${fullName}
                        </a>
                        <a href="tel:${phoneNumber}" style="display: inline-block; background: #ffffff; border: 2px solid #0abfbf; color: #0abfbf; text-decoration: none; padding: 11px 28px; border-radius: 50px; font-size: 14px; font-weight: 600; font-family: Arial, sans-serif; margin: 0 6px;">
                            📞 Call Now
                        </a>
                    </div>

                </div>

                <!-- Footer -->
                <div style="background: #f8fefe; padding: 18px 36px; text-align: center; border-top: 1px solid #e0f7f7;">
                    <p style="margin: 0; font-size: 12px; color: #aaa; font-family: Arial, sans-serif;">
                        This is an automated notification from <strong style="color: #0abfbf;">SmartTour</strong> Admin System &nbsp;|&nbsp; © ${new Date().getFullYear()} SmartTour
                    </p>
                </div>

            </div>
        </div>
    `;
};

module.exports = adminContactTemplate;