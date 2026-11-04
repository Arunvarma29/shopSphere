import nodemailer from "nodemailer";

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );

const sendEmail = async ({ to, subject, text, html }) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, EMAIL_FROM } =
    process.env;
  if (
    !SMTP_HOST ||
    !SMTP_PORT ||
    !SMTP_USER ||
    !SMTP_PASS ||
    !EMAIL_FROM
  ) {
    throw new Error(
      "Email delivery is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and EMAIL_FROM.",
    );
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await transporter.sendMail({ from: EMAIL_FROM, to, subject, text, html });
};

const actionUrl = (path, token) => {
  if (!process.env.CLIENT_URL)
    throw new Error("CLIENT_URL must be configured to send account emails.");
  return `${process.env.CLIENT_URL.replace(/\/$/, "")}${path}?token=${encodeURIComponent(token)}`;
};

export const sendVerificationEmail = async ({ email, name, token }) => {
  const url = actionUrl("/verify-email", token);
  const safeName = escapeHtml(name);
  await sendEmail({
    to: email,
    subject: "Verify your ShopSphere email",
    text: `Hi ${name},\n\nVerify your email and finish creating your ShopSphere account:\n${url}\n\nThis link expires in 24 hours. If you did not request this, you can ignore this email.`,
    html: `<p>Hi ${safeName},</p><p>Verify your email and finish creating your ShopSphere account:</p><p><a href="${url}">Verify my email</a></p><p>This link expires in 24 hours. If you did not request this, you can ignore this email.</p>`,
  });
};

export const sendPasswordResetEmail = async ({ email, name, token }) => {
  const url = actionUrl("/reset-password", token);
  const safeName = escapeHtml(name);
  await sendEmail({
    to: email,
    subject: "Reset your ShopSphere password",
    text: `Hi ${name},\n\nReset your ShopSphere password:\n${url}\n\nThis link expires in 30 minutes. If you did not request this, you can ignore this email.`,
    html: `<p>Hi ${safeName},</p><p>Use the link below to reset your ShopSphere password:</p><p><a href="${url}">Reset my password</a></p><p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>`,
  });
};
