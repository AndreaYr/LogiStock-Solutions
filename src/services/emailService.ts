/**
 * Servicio de notificaciones por email usando Nodemailer (SMTP).
 * Permite usar Gmail, Outlook o cualquier servidor SMTP.
 */

import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

// Configuración del transporte SMTP
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465, // true para 465, false para otros puertos
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

// Verificar conexión al iniciar
transporter.verify((error) => {
  if (error) {
    console.error('[EmailService] ❌ Error de configuración SMTP:', error.message);
    if (!env.SMTP_USER || !env.SMTP_PASS) {
      console.warn('[EmailService] 💡 TIP: Asegúrate de configurar SMTP_USER y SMTP_PASS en el .env');
    }
  } else {
    console.log('[EmailService] ✅ Servidor de correo listo (SMTP)');
  }
});

// ──────────────────────────── Helpers de plantillas ────────────────────────────

function baseLayout(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5faf8;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5faf8;padding:60px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #e0f2e9;">
          <!-- Elegant Header -->
          <tr>
            <td style="background-color:#ffffff;padding:40px 40px;text-align:center;border-bottom:4px solid #47C65C;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="${env.APP_URL}/logo.svg" alt="LogiStock" style="width:56px;height:56px;margin-bottom:8px;display:block;" />
                    <h1 style="margin:0;color:#1a1a1a;font-size:24px;font-weight:700;letter-spacing:0.5px;">
                      <span style="color:#1a1a1a;">Logi</span><span style="color:#47C65C;">Stock</span>
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding:48px 40px;color:#333333;">
              ${body}
            </td>
          </tr>
          <!-- Sophisticated Footer -->
          <tr>
            <td style="background-color:#f9fbfa;padding:32px 40px;text-align:center;border-top:1px solid #e0f2e9;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <a href="#" style="color:#666666;text-decoration:none;margin:0 10px;font-size:14px;font-weight:600;">Soporte</a>
                    <span style="color:#aaaaaa;">|</span>
                    <a href="#" style="color:#666666;text-decoration:none;margin:0 10px;font-size:14px;font-weight:600;">Términos</a>
                    <span style="color:#aaaaaa;">|</span>
                    <a href="#" style="color:#666666;text-decoration:none;margin:0 10px;font-size:14px;font-weight:600;">Privacidad</a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin:0;color:#999999;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">
                      © ${new Date().getFullYear()} LogiStock Solutions.
                    </p>
                    <p style="margin:8px 0 0;color:#999999;font-size:12px;">
                      Este es un correo automático. Por favor, no respondas.<br>
                      Enviado con seguridad desde servidores LogiStock.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function primaryButton(url: string, text: string): string {
  return `
    <div style="text-align:center;margin:36px 0;">
      <a href="${url}" style="background-color:#47C65C;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:bold;display:inline-block;border:1px solid #3aa84a;box-shadow:0 4px 6px rgba(71,198,92,0.2);text-transform:uppercase;letter-spacing:0.5px;transition:background-color 0.2s;">
        ${text}
      </a>
    </div>
    <div style="text-align:center;margin-top:24px;padding-top:24px;border-top:1px dashed #e0f2e9;">
      <p style="color:#666666;font-size:13px;margin:0;">
        ¿El botón no funciona? Copia este enlace en tu navegador:<br/>
        <a href="${url}" style="color:#47C65C;word-break:break-all;text-decoration:none;font-weight:500;display:inline-block;margin-top:8px;">${url}</a>
      </p>
    </div>`;
}

// ──────────────────────────── Métodos públicos ────────────────────────────

/**
 * Envía un email de verificación de cuenta al registrarse.
 */
export async function sendVerificationEmail(
  to: string,
  firstName: string,
  verificationToken: string
): Promise<void> {
  const url = `${env.BACKEND_URL}/api/auth/verify-email?token=${verificationToken}`;

  const body = `
      <h2 style="color:#1a1a1a;margin-top:0;">¡Bienvenido, ${firstName}!</h2>
      <p style="color:#333333;line-height:1.6;">
        Tu cuenta en <strong>LogiStock Solutions</strong> fue creada exitosamente.
        Para activarla, verifica tu dirección de email haciendo clic en el botón de abajo.
      </p>
      <p style="color:#333333;line-height:1.6;">
        Este enlace expira en <strong>24 horas</strong>.
      </p>
      ${primaryButton(url, 'Verificar mi cuenta')}
      <p style="color:#666666;font-size:13px;">
        Si no creaste esta cuenta, puedes ignorar este mensaje.
      </p>`;

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: 'Verifica tu cuenta en LogiStock Solutions',
    html: baseLayout('Verificación de cuenta', body),
  });
}

/**
 * Envía un email de bienvenida después de verificar la cuenta.
 */
export async function sendWelcomeEmail(
  to: string,
  firstName: string
): Promise<void> {
  const body = `
      <h2 style="color:#1a1a1a;margin-top:0;font-size:24px;">¡Cuenta verificada, ${firstName}! 🎉</h2>
      <p style="color:#333333;line-height:1.6;">
        Tu cuenta está activa. Ya puedes iniciar sesión y comenzar a gestionar
        tu inventario con <strong>LogiStock Solutions</strong>.
      </p>
      ${primaryButton(`${env.APP_URL}/login`, 'Iniciar sesión')}`;

  try {
    const info = await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject: '¡Tu cuenta en LogiStock está lista!',
      html: baseLayout('Bienvenido a LogiStock', body),
    });
    console.log('[EmailService] Email de bienvenida enviado:', info.messageId);
  } catch (err) {
    console.error('[EmailService] Error enviando email de bienvenida:', err);
  }
}

/**
 * Envía el enlace para restablecer la contraseña.
 */
export async function sendPasswordResetEmail(
  to: string,
  firstName: string,
  resetToken: string
): Promise<void> {
  const url = `${env.APP_URL}/reset-password?token=${resetToken}`;

  const body = `
      <h2 style="color:#1a1a1a;margin-top:0;">Restablece tu contraseña</h2>
      <p style="color:#333333;line-height:1.6;">
        Hola <strong>${firstName}</strong>, recibimos una solicitud para restablecer
        la contraseña de tu cuenta. Haz clic en el botón para continuar.
      </p>
      <p style="color:#333333;line-height:1.6;">
        Este enlace expira en <strong>1 hora</strong>.
      </p>
      ${primaryButton(url, 'Restablecer contraseña')}
      <p style="color:#d32f2f;font-size:13px;">
        ⚠️ Si no solicitaste este cambio, ignora este mensaje. Tu contraseña actual sigue siendo válida.
      </p>`;

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: 'Restablece tu contraseña — LogiStock Solutions',
    html: baseLayout('Restablecer contraseña', body),
  });
}

/**
 * Confirma que la contraseña fue cambiada exitosamente.
 */
export async function sendPasswordChangedEmail(
  to: string,
  firstName: string
): Promise<void> {
  const body = `
      <h2 style="color:#1a1a1a;margin-top:0;">Contraseña actualizada</h2>
      <p style="color:#333333;line-height:1.6;">
        Hola <strong>${firstName}</strong>, tu contraseña fue cambiada exitosamente el
        <strong>${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</strong>.
      </p>
      <p style="color:#d32f2f;font-size:13px;">
        ⚠️ Si no realizaste este cambio, contacta al soporte inmediatamente.
      </p>
      ${primaryButton(`${env.APP_URL}/login`, 'Ir al inicio de sesión')}`;

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: 'Tu contraseña fue actualizada — LogiStock Solutions',
    html: baseLayout('Contraseña actualizada', body),
  });
}

/**
 * Alerta de inicio de sesión desde un nuevo dispositivo o IP.
 */
export async function sendLoginAlertEmail(
  to: string,
  firstName: string,
  ipAddress: string,
  userAgent: string | null
): Promise<void> {
  const body = `
      <h2 style="color:#1a1a1a;margin-top:0;">Nuevo inicio de sesión detectado</h2>
      <p style="color:#333333;line-height:1.6;">
        Hola <strong>${firstName}</strong>, se detectó un inicio de sesión en tu cuenta.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr style="background:#f9fbfa;">
          <td style="padding:10px 14px;color:#666666;font-size:13px;width:140px;">Fecha y hora</td>
          <td style="padding:10px 14px;color:#1a1a1a;font-size:13px;">${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;color:#666666;font-size:13px;">Dirección IP</td>
          <td style="padding:10px 14px;color:#1a1a1a;font-size:13px;">${ipAddress}</td>
        </tr>
        <tr style="background:#f9fbfa;">
          <td style="padding:10px 14px;color:#666666;font-size:13px;">Dispositivo</td>
          <td style="padding:10px 14px;color:#1a1a1a;font-size:13px;">${userAgent || 'Desconocido'}</td>
        </tr>
      </table>
      <p style="color:#d32f2f;font-size:13px;">
        ⚠️ Si no fuiste tú, cambia tu contraseña inmediatamente.
      </p>`;

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: '⚠️ Nuevo inicio de sesión en tu cuenta',
    html: baseLayout('Alerta de inicio de sesión', body),
  });
}

/**
 * Envía el código OTP al usuario para completar la autenticación en 2 pasos.
 * El código expira en 10 minutos.
 */
export async function sendOtpEmail(
  to: string,
  firstName: string,
  otpCode: string
): Promise<void> {
  const body = `
      <h2 style="color:#1a1a1a;margin-top:0;font-size:24px;font-weight:700;">Código de verificación</h2>
      <p style="color:#333333;line-height:1.7;font-size:16px;">
        Estimado/a <strong>${firstName}</strong>,<br><br>
        Usa el siguiente código de seguridad para completar tu inicio de sesión en <strong>LogiStock Solutions</strong>.
      </p>
      <div style="text-align:center;margin:40px 0;">
        <div style="display:inline-block;background-color:#f0f7f3;border:2px solid #47C65C;border-radius:12px;padding:24px 48px;box-shadow:inset 0 2px 4px rgba(0,0,0,0.02);">
          <span style="font-size:42px;font-weight:800;letter-spacing:14px;color:#1a1a1a;">${otpCode}</span>
        </div>
      </div>
      <p style="color:#666666;font-size:14px;text-align:center;margin-bottom:8px;">
        ⏳ Este código es válido exclusivamente por <strong>10 minutos</strong>.
      </p>
      <p style="color:#d32f2f;font-size:13px;text-align:center;margin-top:0;">
        ⚠️ Si no intentaste iniciar sesión, ignora este mensaje o contacta a soporte.
      </p>`;

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: `🔐 Tu código es ${otpCode} — LogiStock`,
    html: baseLayout('Código de verificación', body),
  });
}

/**
 * Envía una notificación genérica de negocio.
 */
export async function sendNotificationEmail(
  to: string,
  firstName: string,
  title: string,
  message: string
): Promise<void> {
  const body = `
      <h2 style="color:#1a1a1a;margin-top:0;">${title}</h2>
      <p style="color:#333333;line-height:1.6;">
        Hola <strong>${firstName}</strong>,
      </p>
      <div style="background:#f9fbfa;padding:20px;border-radius:8px;border:1px solid #e0f2e9;margin:20px 0;">
        <p style="margin:0;color:#1a1a1a;font-size:16px;line-height:1.5;">
          ${message}
        </p>
      </div>
      <p style="color:#666666;font-size:14px;">
        Puedes ver más detalles ingresando a tu panel de control en LogiStock.
      </p>
      ${primaryButton(`${env.APP_URL}/dashboard`, 'Ir al Dashboard')}`;

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: `${title} — LogiStock Solutions`,
    html: baseLayout(title, body),
  });
}
