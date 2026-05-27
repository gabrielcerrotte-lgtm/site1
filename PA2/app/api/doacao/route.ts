import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define o caminho para salvar o "banco de dados" local no servidor
const dbPath = path.join(process.cwd(), 'transactions_db.json');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, fbp, fbc } = body;

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || '0.0.0.0';
    const userAgent = request.headers.get('user-agent') || '';
    const amountInCents = Math.round(amount * 100);

    // 1. Chama a API da Dentpeg com dados genéricos de cliente para evitar bloqueios antifraude
    const response = await fetch('https://api.dentpeg.com/api/v1/deposits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.DENTPEG_API_KEY as string
      },
      body: JSON.stringify({ 
        amountInCents: amountInCents,
        customer: {
          name: "Doador Anonimo",
          email: "doacao@portoseguroanimal.com",
          document: "00000000000"
        }
      })
    });

    const data = await response.json();
    
    if (!data.deposit) {
        console.error("❌ Erro retornado pela Dentpeg:", data);
        return NextResponse.json({ error: 'Recusado pela Dentpeg', details: data }, { status: 400 });
    }
    
    const transactionId = data.deposit?.id || data.deposit?.transactionId;

    // 2. SALVA A MOCHILA DE DADOS NO HD DO SERVIDOR
    if (transactionId) {
      let db: any = {};
      
      if (fs.existsSync(dbPath)) {
        db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      }
      
      db[transactionId] = {
        amount: amount,
        fbp: fbp || null,
        fbc: fbc || null,
        ip_address: ip,
        user_agent: userAgent,
        capi_sent: false
      };

      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro na rota de doação:", error);
    return NextResponse.json({ error: 'Erro interno ao gerar Pix' }, { status: 500 });
  }
}