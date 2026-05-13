import { NextResponse } from 'next/server';

const globalDb = global as any;
if (!globalDb.transactionsDB) {
  globalDb.transactionsDB = new Map();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, fbp, fbc } = body;

    // Captura IP e User-Agent para a Conversions API (CAPI)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || '0.0.0.0';
    const userAgent = request.headers.get('user-agent') || '';

    // ==========================================
    // A CORREÇÃO DE OURO: Transformando R$ em Centavos para a Dentpeg
    // Ex: R$ 50 * 100 = 5000 centavos
    const amountInCents = Math.round(amount * 100);
    // ==========================================

    // 1. Chama a API da Dentpeg para gerar o Pix
    const response = await fetch('https://api.dentpeg.com/api/v1/deposits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.DENTPEG_API_KEY as string
      },
      // Enviando exatamente a palavra que a Dentpeg exigiu no erro:
      body: JSON.stringify({ amountInCents: amountInCents })
    });

    const data = await response.json();
    
    // ESPIÃO: Se a Dentpeg recusar o pedido de novo, vai imprimir o motivo
    if (!data.deposit) {
        console.error("❌ Erro retornado pela Dentpeg:", data);
    }
    
    // Captura o ID da transação que a Dentpeg criou
    const transactionId = data.deposit?.id || data.deposit?.transactionId;

    // 2. SALVA A "MOCHILA DE DADOS" NA MEMÓRIA PARA O PIXEL
    if (transactionId) {
      globalDb.transactionsDB.set(transactionId, {
        amount: amount, // Mantemos em Reais para enviar certinho para o Facebook depois
        fbp: fbp || null,
        fbc: fbc || null,
        ip_address: ip,
        user_agent: userAgent,
        capi_sent: false // Trava de segurança contra duplicidade
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro na rota de doação:", error);
    return NextResponse.json({ error: 'Erro interno ao gerar Pix' }, { status: 500 });
  }
}