import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { welcomeTemplate } from './templates/welcome.template.js';
import { forgotPasswordTemplate } from './templates/forgot-password.template.js';
import { accountDeletedTemplate } from './templates/account-deleted.template.js';
import { newCommentTemplate } from './templates/new-comment.template.js';

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
      'Welcome to Echowrite ✍️',
      welcomeTemplate(firstName, process.env.APP_URL ?? ''),
    );
  }

  sendForgotPassword(to: string, firstName: string, resetToken: string) {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
    return this.send(
      to,
      'Reset your password 🔐',
      forgotPasswordTemplate(firstName, resetUrl),
    );
  }

  sendAccountDeleted(to: string, firstName: string) {
    return this.send(
      to,
      'Your account has been deleted 👋',
      accountDeletedTemplate(firstName, process.env.APP_URL ?? ''),
    );
  }

  sendNewComment(
    to: string,
    authorFirstName: string,
    postTitle: string,
    commenterName: string,
    commentContent: string,
    postUrl: string,
  ) {
    return this.send(
      to,
      `New comment on "${postTitle}" 💬`,
      newCommentTemplate(
        authorFirstName,
        commenterName,
        postTitle,
        commentContent,
        postUrl,
      ),
    );
  }
}
