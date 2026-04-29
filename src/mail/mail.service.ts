import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  private send(to: string, subject: string, html: string) {
    return this.transporter
      .sendMail({ from: process.env.SMTP_FROM, to, subject, html })
      .catch((err) => this.logger.error(`Mail failed to ${to}`, err.message));
  }

  sendWelcome(to: string, firstName: string) {
    return this.send(
      to,
      'Welcome to the blog!',
      `<p>Hey ${firstName}, glad you're here. Start writing your first post.</p>`,
    );
  }

  sendNewComment(
    to: string,
    postTitle: string,
    commenterName: string,
    postUrl: string,
  ) {
    return this.send(
      to,
      `New comment on "${postTitle}"`,
      `<p>${commenterName} commented on your post <a href="${postUrl}">${postTitle}</a>.</p>`,
    );
  }
}
