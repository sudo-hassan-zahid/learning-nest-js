import { baseTemplate, ctaButton, header } from './base.template.js';

export function accountDeletedTemplate(
  firstName: string,
  appUrl: string,
): string {
  return baseTemplate(`
    ${header('Your account has been deleted', 'Sorry to see you go.', '👋')}
    <tr>
      <td style="padding:40px;">
        <p style="margin:0 0 8px;color:#374151;font-size:16px;line-height:1.7;">
          Hey <strong>${firstName}</strong>,
        </p>
        <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.8;">
          Your account has been successfully deleted. All your data has been
          scheduled for removal. We're sorry to see you go — it was great having
          you as part of the community.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
          <tr>
            <td style="padding:20px;background:#fef2f2;border-radius:10px;border-left:4px solid #f87171;">
              <p style="margin:0 0 6px;color:#b91c1c;font-size:14px;font-weight:600;">
                What happens next
              </p>
              <ul style="margin:0;padding-left:18px;color:#6b7280;font-size:14px;line-height:1.8;">
                <li>Your profile is no longer publicly visible</li>
                <li>Your posts have been unpublished</li>
                <li>Active sessions have been invalidated</li>
              </ul>
            </td>
          </tr>
        </table>

        <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.8;">
          Changed your mind? Accounts are soft-deleted and can be restored within
          <strong>30 days</strong>. After that, all data is permanently removed.
          Reply to this email if you'd like to restore your account.
        </p>

        ${ctaButton('Create a New Account', `${appUrl}/signup`)}

        <p style="margin:28px 0 0;color:#9ca3af;font-size:13px;line-height:1.6;">
          Thank you for being part of the Echowrite community. We hope to see you again.
        </p>
      </td>
    </tr>
  `);
}
