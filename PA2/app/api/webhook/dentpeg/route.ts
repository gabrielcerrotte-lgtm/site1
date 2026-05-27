import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'transactions_db.json');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const transactionId = body.deposit?.id || body.id;
    const status = body.deposit?.status || body.status;

    if (status === 'confirmed' || status === 'paid') {
      
      // 1. Resgata os dados direto do HD do servidor
      if (!fs.existsSync(dbPath)) {
        return NextResponse.json({ received: true, message: 'Banco de dados vazio.' });
      }

      const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      const tx = db[transactionId];

      if (!tx || tx.capi_sent) {
        return NextResponse.json({ received: true, message: 'Já processado ou não encontrado.' });
      }

      const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
      const capiToken = process.env.META_CAPI_TOKEN;

      if (pixelId && capiToken) {
        // 2. Monta o pacote pro Meta
        const capiPayload = {
          data: [
            {
              event_name: 'Purchase',
              event_time: Math.floor(Date.now() / 1000),
              action_source: 'website',
              event_id: transactionId,
              custom_data: { value: tx.amount, currency: 'BRL' },
              user_data: {
                client_ip_address: tx.ip_address,
                client_user_agent: tx.user_agent,
                fbp: tx.fbp,
                fbc: tx.fbc,
                external_id: crypto.createHash('sha256').update(transactionId).digest('hex')
              }
            }
          ]
        };

        // 3. Envia pra CAPI
        const fbResponse = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${capiToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(capiPayload)
        });

        if (fbResponse.ok) {
          // 4. Marca como enviado e salva no HD novamente para evitar duplicidade
          db[transactionId].capi_sent = true;
          fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
          console.log(`✅ [CAPI] Purchase enviado com sucesso (ID: ${transactionId})`);
        } else {
          console.error("❌ [CAPI] Erro do Facebook:", await fbResponse.text());
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro no Webhook:", error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}