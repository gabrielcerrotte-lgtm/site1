import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Pega os dados do Webhook da Dentpeg
    const transactionId = body.deposit?.id || body.id;
    const status = body.deposit?.status || body.status;

    // Conecta na nossa memória temporária
    const globalDb = global as any;
    const txDB = globalDb.transactionsDB;

    // Se o pagamento foi confirmado
    if (status === 'confirmed' || status === 'paid') {
      
      // 1. Resgata a Mochila de Dados do usuário que pagou
      const tx = txDB ? txDB.get(transactionId) : null;

      // PROTEÇÃO DE IDEMPOTÊNCIA: Se não achou os dados ou já enviou pra CAPI, aborta silenciosamente
      if (!tx || tx.capi_sent) {
        return NextResponse.json({ received: true, message: 'Já processado ou dados não encontrados' });
      }

      const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
      const capiToken = process.env.META_CAPI_TOKEN;

      if (pixelId && capiToken) {
        // 2. Monta o pacote de dados exigido pelo Facebook
        const capiPayload = {
          data: [
            {
              event_name: 'Purchase',
              event_time: Math.floor(Date.now() / 1000),
              action_source: 'website',
              event_id: transactionId, // A MÁGICA DA DEDUPLICAÇÃO
              custom_data: {
                value: tx.amount,
                currency: 'BRL',
              },
              user_data: {
                client_ip_address: tx.ip_address,
                client_user_agent: tx.user_agent,
                fbp: tx.fbp,
                fbc: tx.fbc,
                // Cria um hash anônimo obrigatório da transação
                external_id: crypto.createHash('sha256').update(transactionId).digest('hex')
              }
            }
          ]
        };

        // 3. Dispara para os servidores do Mark Zuckerberg
        const fbResponse = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${capiToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(capiPayload)
        });

        if (fbResponse.ok) {
          // 4. Marca como enviado para nunca enviar o mesmo evento 2 vezes
          tx.capi_sent = true;
          txDB.set(transactionId, tx);
          console.log(`✅ [CAPI] Purchase enviado com sucesso (Transação: ${transactionId})`);
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