import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID da transação não fornecido' }, { status: 400 });

  try {
    const response = await fetch(`https://api.dentpeg.com/api/v1/deposits/${id}`, {
      headers: { 'X-API-Key': process.env.DENTPEG_API_KEY as string }
    });
    
    const data = await response.json();
    
    // Devolvemos para o frontend apenas o status atual ('pending', 'confirmed', etc)
    return NextResponse.json({ 
      status: data.deposit?.status || 'pending'
    });
  } catch (error) {
    console.error("Erro ao verificar status:", error);
    return NextResponse.json({ error: 'Erro interno ao contatar Dentpeg' }, { status: 500 });
  }
}