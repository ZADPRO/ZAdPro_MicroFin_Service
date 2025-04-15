export function loanReminderSend(firstName: string, lastName: string) {
  const mail = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Reminder from ZAdpro Fin</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #0066cc; /* Blue color */
            padding: 20px;
            text-align: center;
            color: white;
        }
        .content {
            padding: 20px;
            line-height: 1.6;
        }
        .footer {
            padding: 10px;
            text-align: center;
            font-size: 0.9em;
            color: #555555;
        }
        .button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #0066cc; /* Blue color */
            color: white;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>

<div class="container">
    <div class="header">
        <h1>Reminder from ZAdpro Fin</h1>
    </div>
    <div class="content">
        <p>Dear ${firstName} ${lastName},</p>
        <p>This is a friendly reminder to pay your loan amount due. Please make sure to complete the payment at your earliest convenience to avoid any late fees or penalties.</p>
    </div>
    <div class="footer">
        <p>Thank you,</p>
        <p>The ZAdpro Fin Team</p>
    </div>
</div>

</body>
</html>`;

  return mail;
}
