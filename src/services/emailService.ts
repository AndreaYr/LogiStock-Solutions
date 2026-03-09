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
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#1a56db;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">📦 LogiStock Solutions</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f4f6f8;padding:20px 32px;text-align:center;">
              <p style="margin:0;color:#6b7280;font-size:12px;">
                © ${new Date().getFullYear()} LogiStock Solutions. Todos los derechos reservados.
              </p>
              <p style="margin:4px 0 0;color:#6b7280;font-size:12px;">
                Este correo fue enviado automáticamente, por favor no respondas a este mensaje.
              </p>
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
    <div style="text-align:center;margin:28px 0;">
      <a href="${url}" style="background:#1a56db;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:15px;font-weight:600;display:inline-block;">
        ${text}
      </a>
    </div>
    <p style="color:#6b7280;font-size:12px;text-align:center;">
      Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
      <a href="${url}" style="color:#1a56db;word-break:break-all;">${url}</a>
    </p>`;
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
  const url = `${env.APP_URL}/auth/verify-email?token=${verificationToken}`;

  const body = `
      <h2 style="color:#111827;margin-top:0;">¡Bienvenido, ${firstName}!</h2>
      <p style="color:#374151;line-height:1.6;">
        Tu cuenta en <strong>LogiStock Solutions</strong> fue creada exitosamente.
        Para activarla, verifica tu dirección de email haciendo clic en el botón de abajo.
      </p>
      <p style="color:#374151;line-height:1.6;">
        Este enlace expira en <strong>24 horas</strong>.
      </p>
      ${primaryButton(url, 'Verificar mi cuenta')}
      <p style="color:#6b7280;font-size:13px;">
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
      <h2 style="color:#111827;margin-top:0;">¡Cuenta verificada, ${firstName}! 🎉</h2>
      <p style="color:#374151;line-height:1.6;">
        Tu cuenta está activa. Ya puedes iniciar sesión y comenzar a gestionar
        tu inventario con <strong>LogiStock Solutions</strong>.
      </p>
      ${primaryButton(`${env.APP_URL}/auth/login`, 'Iniciar sesión')}`;

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
  const url = `${env.APP_URL}/auth/reset-password?token=${resetToken}`;

  const body = `
      <h2 style="color:#111827;margin-top:0;">Restablece tu contraseña</h2>
      <p style="color:#374151;line-height:1.6;">
        Hola <strong>${firstName}</strong>, recibimos una solicitud para restablecer
        la contraseña de tu cuenta. Haz clic en el botón para continuar.
      </p>
      <p style="color:#374151;line-height:1.6;">
        Este enlace expira en <strong>1 hora</strong>.
      </p>
      ${primaryButton(url, 'Restablecer contraseña')}
      <p style="color:#dc2626;font-size:13px;">
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
      <h2 style="color:#111827;margin-top:0;">Contraseña actualizada</h2>
      <p style="color:#374151;line-height:1.6;">
        Hola <strong>${firstName}</strong>, tu contraseña fue cambiada exitosamente el
        <strong>${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</strong>.
      </p>
      <p style="color:#dc2626;font-size:13px;">
        ⚠️ Si no realizaste este cambio, contacta al soporte inmediatamente.
      </p>
      ${primaryButton(`${env.APP_URL}/auth/login`, 'Ir al inicio de sesión')}`;

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
      <h2 style="color:#111827;margin-top:0;">Nuevo inicio de sesión detectado</h2>
      <p style="color:#374151;line-height:1.6;">
        Hola <strong>${firstName}</strong>, se detectó un inicio de sesión en tu cuenta.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr style="background:#f9fafb;">
          <td style="padding:10px 14px;color:#6b7280;font-size:13px;width:140px;">Fecha y hora</td>
          <td style="padding:10px 14px;color:#111827;font-size:13px;">${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;color:#6b7280;font-size:13px;">Dirección IP</td>
          <td style="padding:10px 14px;color:#111827;font-size:13px;">${ipAddress}</td>
        </tr>
        <tr style="background:#f9fafb;">
          <td style="padding:10px 14px;color:#6b7280;font-size:13px;">Dispositivo</td>
          <td style="padding:10px 14px;color:#111827;font-size:13px;">${userAgent || 'Desconocido'}</td>
        </tr>
      </table>
      <p style="color:#dc2626;font-size:13px;">
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
 * Envía una notificación genérica de negocio.
 */
export async function sendNotificationEmail(
  to: string,
  firstName: string,
  title: string,
  message: string
): Promise<void> {
  const body = `
      <h2 style="color:#111827;margin-top:0;">${title}</h2>
      <p style="color:#374151;line-height:1.6;">
        Hola <strong>${firstName}</strong>,
      </p>
      <div style="background:#f9fafb;padding:20px;border-radius:8px;border:1px solid #e5e7eb;margin:20px 0;">
        <p style="margin:0;color:#111827;font-size:16px;line-height:1.5;">
          ${message}
        </p>
      </div>
      <p style="color:#6b7280;font-size:14px;">
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
