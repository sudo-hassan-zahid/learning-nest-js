import { baseTemplate, ctaButton, header } from './base.template.js';

export function newCommentTemplate(
  authorFirstName: string,
  commenterName: string,
  postTitle: string,
  commentContent: string,
  postUrl: string,
): string {
  return baseTemplate(`
    ${header('New comment on your post', 'Someone just joined the conversation.', '💬')}
    <tr>
      <td style="padding:40px;">
        <p style="margin:0 0 8px;color:#374151;font-size:16px;line-height:1.7;">
          Hey <strong>${authorFirstName}</strong>,
        </p>
        <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.8;">
          <strong>${commenterName}</strong> left a comment on your post
          <strong>"${postTitle}"</strong>.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
          <tr>
            <td style="padding:20px 24px;background:#f9fafb;border-radius:10px;
              border-left:4px solid #6366f1;">
              <p style="margin:0 0 8px;color:#6366f1;font-size:12px;font-weight:700;
                text-transform:uppercase;letter-spacing:1px;">
                ${commenterName} says
              </p>
              <p style="margin:0;color:#374151;font-size:15px;line-height:1.7;
                font-style:italic;">
                "${commentContent}"
              </p>
            </td>
          </tr>
        </table>

        ${ctaButton('View & Reply →', postUrl)}

        <p style="margin:28px 0 0;color:#9ca3af;font-size:13px;line-height:1.6;">
          To stop receiving comment notifications, update your preferences in your
          account settings.
        </p>
      </td>
    </tr>
  `);
}
