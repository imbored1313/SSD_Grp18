<?php

// email_config.php - Gmail SMTP Configuration

require_once 'vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class EmailService
{
    private $mailer;

    public function __construct()
    {
        $this->mailer = new PHPMailer(true);
        $this->setupSMTP();
    }

    private function setupSMTP()
    {
        try {
// Server settings
            $this->mailer->isSMTP();
            $this->mailer->Host       = getenv('SMTP_HOST');
            $this->mailer->SMTPAuth   = true;
            $this->mailer->Username   = getenv('SMTP_USER');
// Your Zoho email address
            $this->mailer->Password   = getenv('SMTP_PASSWORD');
// Your 16-char app password
            $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $this->mailer->Port       = getenv('SMTP_PORT');
// Default sender
            $this->mailer->setFrom(getenv('SMTP_FROM'), 'ElectraEdge Team');
            $this->mailer->addReplyTo(getenv('SMTP_FROM'), 'ElectraEdge Support');
        } catch (Exception $e) {
            error_log("SMTP Setup Error: " . $e->getMessage());
        }
    }

    public function sendPasswordResetEmail($toEmail, $username, $resetCode)
    {
        try {
// Recipients
            $this->mailer->addAddress($toEmail, $username);
// Content
            $this->mailer->isHTML(true);
            $this->mailer->Subject = 'ElectraEdge - Password Reset Code';
// HTML email body
            $this->mailer->Body = $this->getPasswordResetHTML($username, $resetCode);
// Plain text alternative
            $this->mailer->AltBody = $this->getPasswordResetText($username, $resetCode);
            $result = $this->mailer->send();
// Clear addresses for next email
            $this->mailer->clearAddresses();
            return $result;
        } catch (Exception $e) {
             error_log("Email Send Error: " . $e->getMessage() . " | " . $this->mailer->ErrorInfo);
             file_put_contents(__DIR__ . '/mail-debug.log', date('[Y-m-d H:i:s] ') . $e->getMessage() . " | " . $this->mailer->ErrorInfo . "\n", FILE_APPEND);
             return false;
        }
    }

    public function send2FAEmail($toEmail, $username, $code)
    {
        try {
            $this->mailer->addAddress($toEmail, $username);
            $this->mailer->isHTML(true);
            $this->mailer->Subject = 'ElectraEdge - Your 2FA Verification Code';
            $this->mailer->Body = $this->get2FAHTML($username, $code);
            $this->mailer->AltBody = $this->get2FAText($username, $code);
            $result = $this->mailer->send();
            $this->mailer->clearAddresses();
            return $result;
        } catch (Exception $e) {
            error_log("Email Send Error: " . $e->getMessage() . " | " . $this->mailer->ErrorInfo);
            file_put_contents(__DIR__ . '/mail-debug.log', date('[Y-m-d H:i:s] ') . $e->getMessage() . " | " . $this->mailer->ErrorInfo . "\n", FILE_APPEND);
            return false;
        }
    }

    private function getPasswordResetHTML($username, $resetCode)
    {
        $safeUsername = htmlspecialchars($username, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $safeResetCode = htmlspecialchars($resetCode, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .code-box { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
                .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>⚡ ElectraEdge</h1>
                    <h2>Password Reset Request</h2>
                </div>
                <div class='content'>
                    <p>Hello <strong>{$safeUsername}</strong>,</p>
                    
                    <p>You requested a password reset for your ElectraEdge account. Use the verification code below to reset your password:</p>
                    
                    <div class='code-box'>
                        <div>Your Verification Code:</div>
                        <div class='code'>{$safeResetCode}</div>
                    </div>
                    
                    <div class='warning'>
                        <strong>⏰ Important:</strong> This code will expire in <strong>15 minutes</strong> for security reasons.
                    </div>
                    
                    <p>If you didn't request this password reset, please ignore this email. Your account remains secure.</p>
                    
                    <p>For security questions, contact our support team.</p>
                    
                    <p>Best regards,<br>
                    <strong>ElectraEdge Team</strong></p>
                </div>
                <div class='footer'>
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>";
    }

    private function getPasswordResetText($username, $resetCode)
    {
        $safeUsername = preg_replace('/[\r\n]+/', ' ', $username);
        $safeResetCode = preg_replace('/[\r\n]+/', '', $resetCode);
        return "
Hello {$safeUsername},

You requested a password reset for your ElectraEdge account.

Your verification code is: {$safeResetCode}

This code will expire in 15 minutes.

If you didn't request this reset, please ignore this email.

Best regards,
ElectraEdge Team

---
This is an automated message. Please do not reply.
        ";
    }

    private function get2FAHTML($username, $code)
    {
        $safeUsername = htmlspecialchars($username, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $safeCode = htmlspecialchars($code, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .code-box { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>⚡ ElectraEdge</h1>
                    <h2>2FA Verification</h2>
                </div>
                <div class='content'>
                    <p>Hello <strong>{$safeUsername}</strong>,</p>
                    <p>Your login attempt requires a second step of verification. Please use the code below to complete your login:</p>
                    <div class='code-box'>
                        <div>Your 2FA Code:</div>
                        <div class='code'>{$safeCode}</div>
                    </div>
                    <p>This code will expire in <strong>5 minutes</strong> for your security.</p>
                    <p>If you did not attempt to log in, you can safely ignore this email.</p>
                    <p>Best regards,<br>
                    <strong>ElectraEdge Team</strong></p>
                </div>
                <div class='footer'>
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>";
    }

    private function get2FAText($username, $code)
    {
        $safeUsername = preg_replace('/[\r\n]+/', ' ', $username);
        $safeCode = preg_replace('/[\r\n]+/', '', $code);
        return "Hello {$safeUsername},\n\nYour ElectraEdge 2FA code is: {$safeCode}\n\nThis code will expire in 5 minutes.\nIf you did not attempt to log in, you can ignore this email.\n\nBest regards,\nElectraEdge Team\n---\nThis is an automated message. Please do not reply.";
    }
}
