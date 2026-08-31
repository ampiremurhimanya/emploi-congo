'use strict';

require('dotenv').config();
const { Resend } = require('resend');

console.log('');
console.log('=== EmploiCongo Email Test (Resend) ===');
console.log('');
console.log('Configuration:');
console.log('  API Key:', process.env.RESEND_API_KEY
  ? '✅ Set (' + process.env.RESEND_API_KEY.length + ' chars)'
  : '❌ Not set');
console.log('  From:   ', process.env.MAIL_FROM);
console.log('');

async function test() {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log('Sending test email to: ampireguillaume4@gmail.com');

    const { data, error } = await resend.emails.send({
      from: 'EmploiCongo <onboarding@resend.dev>',
      to: ['ampireguillaume4@gmail.com'],
      subject: '✅ Test EmploiCongo — Email fonctionne !',
      html: `
        <div style="font-family:Arial,sans-serif;padding:32px;
          max-width:500px;border:1px solid #e2e8f0;border-radius:12px;">
          <h2 style="color:#0d1e3d;">✅ Email fonctionne !</h2>
          <p>Resend est configuré correctement pour EmploiCongo.</p>
          <p>Les emails de réinitialisation de mot de passe fonctionnent.</p>
        </div>
      `
    });

    if (error) throw new Error(JSON.stringify(error));

    console.log('✅ Email sent successfully!');
    console.log('   ID:', data.id);
    console.log('');
    console.log('✅ Check inbox at: ampireguillaume4@gmail.com');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

test();