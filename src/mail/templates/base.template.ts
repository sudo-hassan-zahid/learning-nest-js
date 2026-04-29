export function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);max-width:600px;">
          ${content}
          <tr>
            <td style="padding:24px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6;">
                You received this email from <strong style="color:#6366f1;">The Blog</strong>.<br/>
                If you didn't expect this, you can safely ignore it.
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

export function header(title: string, subtitle: string, emoji: string): string {
  return `
  <tr>
    <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:48px 40px;text-align:center;">
      <div style="font-size:48px;margin-bottom:16px;">${emoji}</div>
      <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.3px;">${title}</h1>
      <p style="margin:10px 0 0;color:rgba(255,255,255,0.8);font-size:15px;">${subtitle}</p>
    </td>
  </tr>`;
}

export function ctaButton(label: string, url: string): string {
  return `
  <table cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr>
      <td style="background:#6366f1;border-radius:10px;">
        <a href="${url}"
          style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.2px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

export function infoBox(text: string): string {
  return `
  <tr>
    <td style="padding:16px 20px;background:#f0f0ff;border-left:4px solid #6366f1;border-radius:0 8px 8px 0;margin:16px 0;">
      <p style="margin:0;color:#4338ca;font-size:14px;line-height:1.6;">${text}</p>
    </td>
  </tr>`;
}

export function featureRow(emoji: string, title: string, desc: string): string {
  return `
  <tr>
    <td style="padding:14px 16px;background:#f9fafb;border-radius:10px;margin-bottom:10px;">
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.5;">
        ${emoji} <strong>${title}</strong> — ${desc}
      </p>
    </td>
  </tr>
  <tr><td style="height:8px;"></td></tr>`;
}
