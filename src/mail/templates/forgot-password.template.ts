import { baseTemplate, ctaButton, header, infoBox } from './base.template.js';

export function forgotPasswordTemplate(
  firstName: string,
  resetUrl: string,
): string {
  return baseTemplate(`
    ${header('Reset your password', 'We received a request to reset your password.', '🔐')}
    <tr>
      <td style="padding:40px;">
        <p style="margin:0 0 8px;color:#374151;font-size:16px;line-height:1.7;">
          Hey <strong>${firstName}</strong>,
        </p>
        <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.8;">
          Someone requested a password reset for your account. If that was you,
          click the button below. The link expires in <strong>15 minutes</strong>.
        </p>

        ${ctaButton('Reset My Password →', resetUrl)}

        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoBox('This link is single-use and expires in 15 minutes. After resetting, all active sessions will remain valid.')}
        </table>

        <p style="margin:28px 0 8px;color:#374151;font-size:14px;font-weight:600;">
          Didn't request this?
        </p>
        <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.7;">
          No action needed — your password won't change and this link will expire
          on its own. If you're worried someone else requested this, consider
          changing your password after logging in.
        </p>

        <hr style="margin:28px 0;border:none;border-top:1px solid #e5e7eb;" />

        <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${resetUrl}" style="color:#6366f1;word-break:break-all;">${resetUrl}</a>
        </p>
      </td>
    </tr>
  `);
}
