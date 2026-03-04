// utils/templates/userContactTemplate.js

const userContactTemplate = ({ fullName, subject }) => {
    return `
        <div style="font-family: 'Georgia', serif; padding: 40px 20px; background: linear-gradient(135deg, #e0f7f7 0%, #f0fafa 100%); min-height: 100vh;">
            <div style="max-width: 620px; margin: auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,180,180,0.10);">

                <!-- Header Banner -->
                <div style="background: linear-gradient(135deg, #0abfbf 0%, #007a7a 100%); padding: 36px 32px 28px; text-align: center; position: relative;">
                    <div style="display: inline-block; background: rgba(255,255,255,0.15); border-radius: 50%; padding: 12px 16px; margin-bottom: 12px;">
                        <span style="font-size: 28px;">✈️</span>
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: 1px; font-family: 'Georgia', serif;">SmartTour</h1>
                    <p style="margin: 4px 0 0; color: rgba(255,255,255,0.80); font-size: 13px; letter-spacing: 2px; font-family: Arial, sans-serif; text-transform: uppercase;">Tour & Travel</p>
                </div>

                <!-- Body -->
                <div style="padding: 36px 36px 28px;">

                    <h2 style="color: #00494a; font-size: 22px; margin: 0 0 8px; font-family: 'Georgia', serif;">
                        Hi ${fullName}! 👋
                    </h2>

                    <p style="color: #444; font-size: 15px; line-height: 1.7; margin: 0 0 20px; font-family: Arial, sans-serif;">
                        Thank you for reaching out to us. We're thrilled to hear from you and will make sure your travel experience is nothing short of extraordinary! 🌍
                    </p>

                    <p style="color: #444; font-size: 15px; font-family: Arial, sans-serif; margin: 0 0 10px;">
                        We've received your message regarding:
                    </p>

                    <!-- Subject Box -->
                    <div style="background: linear-gradient(135deg, #f0ffff, #e6fafa); border-left: 4px solid #0abfbf; border-radius: 0 8px 8px 0; padding: 14px 18px; margin-bottom: 24px;">
                        <strong style="color: #007a7a; font-size: 15px; font-family: Arial, sans-serif;">📌 ${subject}</strong>
                    </div>

                    <p style="color: #444; font-size: 15px; line-height: 1.7; font-family: Arial, sans-serif; margin: 0 0 28px;">
                        Our team is on it! We'll review your query and get back to you within <strong style="color: #0abfbf;">24–48 hours</strong>. In the meantime, feel free to explore our latest tours and destinations.
                    </p>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin-bottom: 28px;">
                        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #0abfbf, #007a7a); color: #ffffff; text-decoration: none; padding: 13px 32px; border-radius: 50px; font-size: 15px; font-weight: 600; font-family: Arial, sans-serif; letter-spacing: 0.5px;">
                            ➤ Explore Tours
                        </a>
                    </div>

                    <!-- Divider -->
                    <hr style="border: none; border-top: 1px solid #e0f7f7; margin: 0 0 24px;" />

                    <!-- Stats Row -->
                    <div style="display: flex; gap: 0; text-align: center; margin-bottom: 8px;">
                        <div style="flex: 1; padding: 12px 8px; border-right: 1px solid #e0f7f7;">
                            <div style="font-size: 20px; font-weight: 700; color: #0abfbf; font-family: Arial, sans-serif;">500+</div>
                            <div style="font-size: 11px; color: #888; font-family: Arial, sans-serif; text-transform: uppercase; letter-spacing: 1px;">Tours</div>
                        </div>
                        <div style="flex: 1; padding: 12px 8px; border-right: 1px solid #e0f7f7;">
                            <div style="font-size: 20px; font-weight: 700; color: #0abfbf; font-family: Arial, sans-serif;">50+</div>
                            <div style="font-size: 11px; color: #888; font-family: Arial, sans-serif; text-transform: uppercase; letter-spacing: 1px;">Destinations</div>
                        </div>
                        <div style="flex: 1; padding: 12px 8px;">
                            <div style="font-size: 20px; font-weight: 700; color: #0abfbf; font-family: Arial, sans-serif;">10K+</div>
                            <div style="font-size: 11px; color: #888; font-family: Arial, sans-serif; text-transform: uppercase; letter-spacing: 1px;">Happy Travelers</div>
                        </div>
                    </div>

                </div>

                <!-- Footer -->
                <div style="background: #f8fefe; padding: 22px 36px; text-align: center; border-top: 1px solid #e0f7f7;">
                    <p style="margin: 0 0 10px; font-size: 13px; color: #888; font-family: Arial, sans-serif;">
                        📍 123 Travel Street, Discovery City, TC 12345
                    </p>
                    <!-- Social Icons (text-based for email compatibility) -->
                    <p style="margin: 0 0 14px;">
                        <a href="#" style="color: #0abfbf; text-decoration: none; margin: 0 6px; font-family: Arial, sans-serif; font-size: 13px;">Twitter</a>
                        <span style="color: #ccc;">|</span>
                        <a href="#" style="color: #0abfbf; text-decoration: none; margin: 0 6px; font-family: Arial, sans-serif; font-size: 13px;">Facebook</a>
                        <span style="color: #ccc;">|</span>
                        <a href="#" style="color: #0abfbf; text-decoration: none; margin: 0 6px; font-family: Arial, sans-serif; font-size: 13px;">Instagram</a>
                        <span style="color: #ccc;">|</span>
                        <a href="#" style="color: #0abfbf; text-decoration: none; margin: 0 6px; font-family: Arial, sans-serif; font-size: 13px;">YouTube</a>
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #aaa; font-family: Arial, sans-serif;">
                        © ${new Date().getFullYear()} SmartTour. Travel. Explore. Live. &nbsp;|&nbsp;
                        <a href="#" style="color: #aaa; text-decoration: underline;">Unsubscribe</a>
                    </p>
                </div>

            </div>
        </div>
    `;
};

module.exports = userContactTemplate;