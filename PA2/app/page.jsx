"use client";

import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from 'qrcode.react'; 
import { ChevronDown, Check, Heart, ShieldCheck, Copy, Star, X, QrCode, AlertCircle, MapPin } from "lucide-react";

// Helpers para rastreamento e IDs
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};
const generateId = (prefix) => `${prefix}_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;

export default function Home() {
  const [baseValue, setBaseValue] = useState(null);
  const [bumpValue, setBumpValue] = useState(0);
  const [isOrderbumpOpen, setIsOrderbumpOpen] = useState(false);
  const [isPixOpen, setIsPixOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [isPaid, setIsPaid] = useState(false);

  const values = [25, 30, 40, 50, 75, 100, 150, 200, 250, 300, 400, 500, 600, 750, 900, 1000, 2000, 3000, 4000, 5000];
  const orderbumpOptions = [10, 20, 30, 40, 50];
  const totalAmount = (baseValue || 0) + bumpValue;
  const viewContentFired = useRef(false);

  // Pixel: ViewContent
  useEffect(() => {
    if (!viewContentFired.current && typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', { content_name: 'Página de Doação', currency: 'BRL', value: 0 }, { eventID: generateId('vc') });
      viewContentFired.current = true;
    }
  }, []);

  // Radar de pagamento
  useEffect(() => {
    let interval;
    if (pixData?.transactionId && !isPaid) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/status?id=${pixData.transactionId}`);
          const data = await res.json();
          if (data.status === 'confirmed') {
            setIsPaid(true);
            if (typeof window !== 'undefined' && window.fbq) {
              window.fbq('track', 'Purchase', { value: totalAmount, currency: 'BRL' }, { eventID: pixData.transactionId });
            }
            clearInterval(interval);
          }
        } catch (e) { console.error("Erro no polling"); }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [pixData, isPaid, totalAmount]);

  const handleSelectValue = (val) => {
    setBaseValue(val);
    setBumpValue(0);
    setIsOrderbumpOpen(true);
  };

  const handleFinalize = async () => {
    setIsOrderbumpOpen(false);
    setIsPixOpen(true);
    setLoading(true);

    // Dispara o InitiateCheckout apenas após a decisão do order bump
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', { value: totalAmount, currency: 'BRL' }, { eventID: generateId('ic') });
    }

    try {
      const fbp = getCookie('_fbp');
      const fbc = getCookie('_fbc');
      const res = await fetch('/api/doacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount, fbp, fbc })
      });
      const data = await res.json();
      
      if (data.deposit) {
        setPixData(data.deposit);
        const transId = data.deposit.transactionId || data.deposit.id || generateId('api');
        if (typeof window !== 'undefined' && window.fbq) {
          window.fbq('track', 'AddPaymentInfo', { value: totalAmount, currency: 'BRL', payment_method: 'pix' }, { eventID: `api_${transId}` });
        }
      } else {
        // Trata o erro se o Dentpeg recusar a geração e fecha o modal
        alert("Ocorreu uma instabilidade na geração do Pix. Por favor, tente novamente em alguns instantes.");
        setIsPixOpen(false);
      }
    } catch (error) { 
      alert("Erro de conexão. Verifique sua internet."); 
      setIsPixOpen(false);
    }
    finally { setLoading(false); }
  };

  // Dispara o evento Lead ao clicar em Doar Valor Personalizado
  const handleCustomDonationClick = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead', {
        content_name: 'Doação Valor Personalizado',
        currency: 'BRL'
      }, { eventID: generateId('lead') });
    }
  };

  const qrText = pixData?.qrcode || pixData?.qrCode || pixData?.qr_code || pixData?.payload || pixData?.emv || "";

  return (
    <main className="min-h-screen bg-[#FAFAFA] font-sans text-gray-800">
      
      {/* CABEÇALHO */}
      <header className="w-full bg-white border-b border-gray-100 h-20 flex items-center justify-between px-4 md:px-12 z-40 relative shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-12 w-12 object-contain" />
          <div className="font-bold text-[#A5682A] leading-tight">Porto Seguro <br /> Animal</div>
        </div>
        <a href="#doacao" className="bg-[#00C853] hover:bg-[#00B248] text-white px-8 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 text-sm shadow-md">
          <Heart size={16} className="fill-white" /> DOAR
        </a>
      </header>

      {/* HERO SECTION */}
      <section className="relative h-[550px] flex items-center justify-center">
        <div className="absolute inset-0">
          <img src="/1.jpg" alt="Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="relative z-10 text-center px-4 -mt-20">
          <span className="bg-red-600 text-white text-[11px] font-black px-3 py-1 rounded-sm uppercase tracking-wider mb-4 inline-block">Urgência Máxima</span>
          <h2 className="text-5xl md:text-[64px] font-extrabold text-white mb-4 tracking-tight leading-none">Eles só têm você.</h2>
          <p className="text-lg md:text-xl text-gray-200 mb-8 font-light">Sua doação salva vidas reais. Ajude-nos a comprar ração hoje.</p>
          <a href="#doacao" className="bg-[#FF9800] hover:bg-[#F57C00] text-white text-lg font-bold py-4 px-10 rounded-xl transition-all shadow-lg inline-block">QUERO AJUDAR AGORA</a>
        </div>
      </section>

      {/* QUADRO DE DOAÇÃO E FAQ */}
      <section id="doacao" className="relative z-20 max-w-5xl mx-auto px-4 -mt-32 mb-16">
        <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] p-6 md:p-12 pb-16">
          
          <div className="text-center mb-8 mt-4">
            <h3 className="text-2xl font-bold text-gray-900">1. Escolha o valor da sua doação</h3>
            <p className="text-gray-500 text-sm mt-1">Todo valor ajuda a encher uma barriguinha.</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-10">
            {values.map((val) => (
              <button key={val} onClick={() => handleSelectValue(val)} className="border border-gray-200 rounded-xl py-3.5 text-[15px] font-bold text-gray-700 hover:border-[#00C853] hover:text-[#00C853] hover:bg-[#F2FCF5] transition-all">
                R$ {val}
              </button>
            ))}
          </div>

          <div className="bg-[#FFFDF5] border border-[#FDEBCE] rounded-xl p-8 mb-16 text-center">
            <div className="flex items-center justify-center gap-2 text-[#D37D00] font-bold mb-4 text-[15px]"><Heart size={18} className="fill-[#D37D00]" /> Prefere doar outro valor?</div>
            <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-green-200 text-xs font-semibold mb-6 text-gray-700"><ShieldCheck size={16} className="text-[#00C853]" /> Recebedor do Pix: <strong className="text-green-700">PLEBANK.COM.BR</strong></div>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">Você pode escolher doar um valor diferente de forma segura e rápida através do nosso checkout personalizado.</p>
            <a 
              href="https://dentpeg.com/checkout/portoseguroanimal" 
              target="_blank" 
              rel="noreferrer" 
              onClick={handleCustomDonationClick}
              className="inline-flex items-center justify-center bg-[#E67300] hover:bg-[#CC6600] text-white font-bold py-3.5 px-8 rounded-lg transition-all shadow-md gap-2 w-full md:w-auto"
            >
              Doar Valor Personalizado
            </a>
          </div>

          {/* PERGUNTAS FREQUENTES */}
          <div className="max-w-4xl mx-auto border-t border-gray-50 pt-12">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 text-[#1976D2] font-bold text-lg mb-1"><AlertCircle size={20} /> Perguntas Frequentes</div>
              <p className="text-gray-500 text-sm">Transparência é nosso compromisso com você.</p>
            </div>
            <div className="space-y-3">
              <details className="group border border-gray-200 rounded-xl bg-white cursor-pointer"><summary className="flex items-center justify-between p-5 font-bold text-[15px] text-gray-800">Para onde vai o dinheiro da minha doação?<ChevronDown size={20} className="text-gray-400 group-open:rotate-180 transition" /></summary>
              <div className="p-5 pt-0 text-gray-600 border-t border-gray-100 mt-2 text-sm leading-relaxed">100% do valor é destinado diretamente para o custeio do abrigo. Isso inclui: compra de ração premium e comum, medicamentos, pagamento de cirurgias veterinárias de emergência, vacinas, produtos de limpeza e manutenção do espaço onde os animais vivem.</div></details>
              <details className="group border border-gray-200 rounded-xl bg-white cursor-pointer"><summary className="flex items-center justify-between p-5 font-bold text-[15px] text-gray-800">É seguro doar através do site?<ChevronDown size={20} className="text-gray-400 group-open:rotate-180 transition" /></summary>
              <div className="p-5 pt-0 text-gray-600 border-t border-gray-100 mt-2 text-sm leading-relaxed">Sim, totalmente seguro. O site não processa pagamentos diretamente; nós apenas geramos o código Pix para você pagar no aplicativo do seu banco. Seus dados financeiros nunca passam por nós. Utilizamos a tecnologia do Banco Central (Pix) que é criptografada e segura.</div></details>
              <details className="group border border-gray-200 rounded-xl bg-white cursor-pointer"><summary className="flex items-center justify-between p-5 font-bold text-[15px] text-gray-800">Posso doar ração ou remédios ao invés de dinheiro?<ChevronDown size={20} className="text-gray-400 group-open:rotate-180 transition" /></summary>
              <div className="p-5 pt-0 text-gray-600 border-t border-gray-100 mt-2 text-sm leading-relaxed">Com certeza! Aceitamos doações físicas no nosso endereço: Ramal Padre Vitório Galiane 210 Bairro Jardim Marco Zero, Macapá, AP. Remédios dentro da validade, ração selada, cobertores e produtos de higiene são sempre bem-vindos.</div></details>
              <details className="group border border-gray-200 rounded-xl bg-white cursor-pointer"><summary className="flex items-center justify-between p-5 font-bold text-[15px] text-gray-800">O abrigo recebe ajuda do governo?<ChevronDown size={20} className="text-gray-400 group-open:rotate-180 transition" /></summary>
              <div className="p-5 pt-0 text-gray-600 border-t border-gray-100 mt-2 text-sm leading-relaxed">Não. Somos uma iniciativa independente e privada. Sobrevivemos exclusivamente da generosidade de doadores como você para manter as portas abertas e os animais alimentados.</div></details>
              <details className="group border border-gray-200 rounded-xl bg-white cursor-pointer"><summary className="flex items-center justify-between p-5 font-bold text-[15px] text-gray-800">Como posso acompanhar o uso das doações?<ChevronDown size={20} className="text-gray-400 group-open:rotate-180 transition" /></summary>
              <div className="p-5 pt-0 text-gray-600 border-t border-gray-100 mt-2 text-sm leading-relaxed">Prezamos pela transparência total. Publicamos atualizações frequentes, fotos dos resgates e notas fiscais em nossas redes sociais. Além disso, nosso abrigo está aberto para visitas, onde você pode ver pessoalmente o impacto da sua ajuda.</div></details>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO TRANSPARÊNCIA */}
      <section className="max-w-5xl mx-auto px-4 py-8 mb-16">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2">
            <div className="grid grid-cols-2 gap-3">
              <img src="/2.jpg" className="rounded-2xl object-cover h-40 w-full shadow-sm" alt="Resgate 1" />
              <img src="/3.jpg" className="rounded-2xl object-cover h-40 w-full shadow-sm" alt="Resgate 2" />
              <img src="/4.jpg" className="rounded-2xl object-cover h-56 w-full col-span-2 shadow-sm" alt="Resgate 3" />
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <h3 className="text-[28px] font-bold text-gray-900 mb-4 tracking-tight">Transparência Total</h3>
            <p className="text-gray-500 mb-6 leading-relaxed text-[15px]">O Porto Seguro Animal atua há anos em Macapá. AP, resgatando animais em situações extremas.</p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-600 text-sm"><div className="w-5 h-5 rounded-full bg-[#E8F8F0] flex items-center justify-center shrink-0"><Check size={12} className="text-[#00C853] font-bold"/></div>Endereço: Ramal Padre Vitório Galiane 210 Bairro Jardim Marco Zero, Macapá, AP</li>
              <li className="flex items-center gap-3 text-gray-600 text-sm"><div className="w-5 h-5 rounded-full bg-[#E8F8F0] flex items-center justify-center shrink-0"><Check size={12} className="text-[#00C853] font-bold"/></div>Visitas abertas ao público</li>
              <li className="flex items-center gap-3 text-gray-600 text-sm"><div className="w-5 h-5 rounded-full bg-[#E8F8F0] flex items-center justify-center shrink-0"><Check size={12} className="text-[#00C853] font-bold"/></div>Prestação de contas mensal</li>
            </ul>
          </div>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="bg-[#1A1A1A] py-16 text-center text-gray-400">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 border border-gray-600 rounded-full flex items-center justify-center"><img src="/logo.png" className="w-6 h-6 grayscale brightness-200" alt="Logo" /></div>
            <span className="text-white font-bold text-lg">Porto Seguro Animal</span>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8 text-sm">
            <div className="flex items-center gap-1.5"><MapPin size={16} className="text-amber-500"/> Macapá, AP (Sede Oficial)</div>
            <div className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-500"/> Recebedor Oficial: PLEBANK</div>
          </div>
          <hr className="border-gray-800 mb-8 max-w-[300px] mx-auto" />
          <p className="text-xs tracking-wide">&copy; 2026 Porto Seguro Animal. Todos os direitos reservados. Processado por PLEBANK</p>
        </div>
      </footer>

      {/* MODAL ORDERBUMP */}
      {isOrderbumpOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button onClick={() => setIsOrderbumpOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1"><X size={20} /></button>
            <div className="flex justify-center mb-4 mt-2"><div className="w-14 h-14 bg-[#E6F0FF] rounded-full flex items-center justify-center"><Star size={30} className="text-[#1976D2] fill-[#1976D2]" /></div></div>
            <h3 className="text-2xl font-bold text-[#1976D2] text-center mb-2">Sua doação de R$ {baseValue} é incrível!</h3>
            <p className="text-[#1976D2] text-center text-sm mb-6 leading-relaxed px-2">Gostaria de adicionar um pouquinho mais para ajudar na compra de <strong>medicamentos especiais</strong>?</p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {orderbumpOptions.map(opt => (
                <button key={opt} onClick={() => setBumpValue(bumpValue === opt ? 0 : opt)} className={`border-2 rounded-lg px-5 py-2 font-bold transition-all ${bumpValue === opt ? 'border-[#1976D2] bg-[#E6F0FF] text-[#1976D2]' : 'border-[#D0DEFF] text-[#1976D2] hover:bg-[#F5F8FF]'}`}>+ R$ {opt}</button>
              ))}
            </div>
            <div className="bg-[#FAFAFA] border border-gray-100 rounded-xl p-5">
              <div className="flex justify-between items-center mb-6"><span className="text-gray-600 font-medium">Sua doação total:</span><span className="text-3xl font-black text-[#00C853]">R$ {totalAmount.toFixed(2).replace('.', ',')}</span></div>
              <button onClick={handleFinalize} className="w-full bg-[#00C853] hover:bg-[#00B248] text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 text-lg transition-transform hover:scale-[1.02]">FINALIZAR E PAGAR →</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PIX COM GERADOR QRCODESVG */}
      {isPixOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto py-10 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl relative shadow-2xl my-auto">
            {!isPaid && <button onClick={() => setIsPixOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1 z-10"><X size={20} /></button>}
            <div className="p-8">
              {isPaid ? (
                <div className="text-center py-10">
                  <div className="w-24 h-24 bg-[#E8F8F0] text-[#00C853] rounded-full flex items-center justify-center mx-auto mb-6"><Check size={50} /></div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Doação Confirmada!</h3>
                  <p className="text-[#00C853] text-lg font-medium mb-4">Obrigado por salvar vidas.</p>
                  <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">Seu pagamento de R$ {totalAmount.toFixed(2).replace('.',',')} foi recebido com sucesso pela PLEBANK e já está a caminho do abrigo.</p>
                  <button onClick={() => window.location.reload()} className="bg-gray-900 text-white font-bold py-3 px-8 rounded-lg hover:scale-105 transition">Fechar</button>
                </div>
              ) : loading ? (
                <div className="text-center py-20 flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-[#00C853] border-t-transparent rounded-full animate-spin mb-4"></div>
                  <h3 className="text-xl font-bold text-gray-700">Gerando seu Pix seguro...</h3>
                </div>
              ) : qrText ? (
                <>
                  <div className="flex justify-center mb-4"><div className="w-16 h-16 bg-[#E8F8F0] rounded-full flex items-center justify-center text-[#00C853] shadow-inner"><QrCode size={32} /></div></div>
                  <h3 className="text-2xl font-extrabold text-center text-gray-900 mb-4 tracking-tight">Gere seu Pix Agora</h3>
                  <div className="flex justify-center mb-6"><div className="inline-flex items-center gap-2 bg-[#F0FFF5] border border-[#A3E5C1] px-4 py-2 rounded-full text-xs font-semibold text-gray-700"><ShieldCheck size={16} className="text-[#00C853]" /> Recebedor Oficial: <strong className="text-gray-800 underline">PLEBANK.COM.BR</strong></div></div>
                  <p className="text-center text-gray-600 mb-8 text-sm">Escaneie o código ou use o botão para doar <strong className="text-gray-900 text-lg">R$ {totalAmount.toFixed(2).replace('.', ',')}</strong>.</p>
                  <div className="flex flex-col md:flex-row gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold text-gray-400 mb-3 tracking-widest uppercase">Escanear QR Code</span>
                      <QRCodeSVG value={String(qrText)} size={192} className="mb-4 border-4 border-white rounded-2xl p-2 bg-white shadow-md" includeMargin={true} />
                      <p className="text-[11px] text-center text-gray-500 px-2">Abra o app do banco e escolha <strong>Pagar com Pix / Escanear QR</strong>.</p>
                    </div>
                    <div className="w-px h-40 bg-gray-200 hidden md:block"></div>
                    <div className="flex-1 flex flex-col justify-center">
                      <span className="text-[10px] font-bold text-gray-400 mb-2 tracking-widest uppercase">Pix Copia e Cola</span>
                      <div className="border border-gray-200 rounded-lg p-3 bg-white text-[11px] text-gray-500 font-mono break-all h-24 overflow-hidden relative mb-4 shadow-sm">
                        {qrText}
                        <div className="absolute top-0 right-0 h-full w-4 bg-gradient-to-l from-white to-transparent"></div>
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(qrText);
                          if (typeof window !== 'undefined' && window.fbq) {
                            window.fbq('track', 'Purchase', { 
                              value: totalAmount, 
                              currency: 'BRL' 
                            }, { eventID: pixData?.transactionId || generateId('cp') });
                          }
                          
                          // Adicionando o atraso de 0.5s para o Facebook processar antes de congelar a tela
                          setTimeout(() => {
                            alert("Copiado!");
                          }, 500);
                        }} 
                        className="w-full bg-[#00C853] hover:bg-[#00B248] text-white font-bold py-3.5 rounded-lg flex justify-center items-center gap-2 text-sm shadow-md transition-all hover:scale-105"
                      >
                        <Copy size={16} /> COPIAR CÓDIGO
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 bg-[#FFF8E6] border border-[#FDEBCE] rounded-lg p-3 text-xs text-[#B36B00] shadow-sm italic text-center">
                    Nota: Utilizamos a <strong>PLEBANK.COM.BR</strong> como nossa intermediadora oficial. Transação segura.
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}