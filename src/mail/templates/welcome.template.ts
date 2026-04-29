import { baseTemplate, ctaButton, featureRow, header } from './base.template.js';

export function welcomeTemplate(firstName: string, appUrl: string): string {
  return baseTemplate(`
    ${header('Welcome aboard!', 'Your blogging journey starts now.', '✍️')}
    <tr>
      <td style="padding:40px;">
        <p style="margin:0 0 8px;color:#374151;font-size:16px;line-height:1.7;">
          Hey <strong>${firstName}</strong>,
        </p>
        <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.8;">
          Your account is live. Write your first post, grow your audience, and share
          what's on your mind — everything you need is ready and waiting.
        </p>

        ${ctaButton('Start Writing →', `${appUrl}/new`)}

        <p style="margin:28px 0 14px;color:#374151;font-size:13px;font-weight:700;
          text-transform:uppercase;letter-spacing:1px;">
          What's included
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${featureRow('📝', 'Posts', 'Draft, publish, or archive your writing anytime')}
          ${featureRow('💬', 'Comments & Likes', 'Build real conversations with your readers')}
          ${featureRow('🔗', 'Share Links', 'Generate shareable short links for any post')}
          ${featureRow('🖼️', 'Image Uploads', 'Attach images served via Cloudinary CDN')}
          ${featureRow('🏷️', 'Tags', 'Organise your content and help readers find you')}
        </table>

        <p style="margin:28px 0 0;color:#9ca3af;font-size:13px;line-height:1.6;">
          Have questions? Just reply to this email — we're happy to help.
        </p>
      </td>
    </tr>
  `);
}
