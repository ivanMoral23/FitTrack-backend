import nodemailer from 'nodemailer';

export class EmailService {
    static transporter = null;

    static async initTransporter() {
        if (EmailService.transporter) return EmailService.transporter;

        // Si tenemos credenciales SMTP reales en .env, las usamos
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            EmailService.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
        } else {
            // Generar una cuenta de pruebas en Ethereal (Ideal para Testear Backend sin emails reales)
            console.log("⚠️ No SMTP settings in .env. Generando cuenta Ethereal de pruebas...");
            const testAccount = await nodemailer.createTestAccount();
            EmailService.transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
        }
    }

    static async sendVerificationEmail(userEmail, token) {
        await EmailService.initTransporter();

        const baseUrl = process.env.BASE_URL || 'http://localhost:8081';
        const verifyUrl = `${baseUrl}/verify/${token}`;

        const mailOptions = {
            from: '"GymTracker Admin" <no-reply@gymtracker.app>',
            to: userEmail,
            subject: 'Confirma tu correo en GymTracker',
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; max-width: 500px; margin: auto;">
                    <h2>¡Bienvenido a GymTracker! 💪</h2>
                    <p>Gracias por registrarte. Solo queda un paso más.</p>
                    <p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
                    <br/>
                    <a href="${verifyUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Verificar Mi Cuenta</a>
                    <br/><br/>
                    <p style="margin-top: 20px; color: #666; font-size: 12px;">Si no te registraste en GymTracker, ignora este correo.</p>
                </div>
            `
        };

        const info = await EmailService.transporter.sendMail(mailOptions);
        
        console.log("📧 Correo de verificación enviado a: %s", userEmail);
        
        // Si no hay configuración real SMTP, mostramos la URL mágica para inspeccionar el buzón mockeado.
        if (!process.env.SMTP_HOST) {
            console.log("🔗 Ethereal URL Mágica (Ábrela para leer el correo mockeado): %s", nodemailer.getTestMessageUrl(info));
        }
    }

    static async sendPasswordResetEmail(userEmail, token) {
        await EmailService.initTransporter();

        const baseUrl = process.env.BASE_URL || 'http://localhost:8081';
        const resetUrl = `${baseUrl}/auth/reset-password/${token}`;

        const mailOptions = {
            from: '"GymTracker Admin" <no-reply@gymtracker.app>',
            to: userEmail,
            subject: 'Recuperación de Contraseña - GymTracker',
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; max-width: 500px; margin: auto;">
                    <h2>¿Olvidaste tu contraseña? 🔐</h2>
                    <p>No te preocupes, nos pasa a los mejores. Has solicitado restablecer tu contraseña.</p>
                    <p>Haz clic en el siguiente enlace para crear una nueva:</p>
                    <br/>
                    <a href="${resetUrl}" style="padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer Contraseña</a>
                    <br/><br/>
                    <p style="margin-top: 20px; color: #666; font-size: 12px;">El enlace expirará por seguridad en 15 minutos.</p>
                    <p style="color: #666; font-size: 12px;">Si tú no lo has solicitado, por favor ignora este correo. Tu clave seguirá siendo exactamente la misma.</p>
                </div>
            `
        };

        const info = await EmailService.transporter.sendMail(mailOptions);
        console.log("📧 Correo de Recuperación enviado a: %s", userEmail);
        
        if (!process.env.SMTP_HOST) {
            console.log("🔗 Ethereal URL Mágica (Password Reset): %s", nodemailer.getTestMessageUrl(info));
        }
    }
}
