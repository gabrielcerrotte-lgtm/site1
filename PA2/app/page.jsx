"use client";

import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from 'qrcode.react'; 
import { ChevronDown, Check, Heart, ShieldCheck, Copy, Star, X, QrCode, AlertCircle } from "lucide-react";

// Helpers para rastreamento e IDs
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};
const generateId = (prefix) => `${prefix}_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;

// FUNÇÃO ESPIÃ DE PIXEL
const firePixel = (eventName, data, options) => {
  console.log(`🦊 [PIXEL DEBUG] Disparando evento: ${eventName}`, data || '', options || '');
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, data, options);
  }
};

// =========================================================================
// DICIONÁRIO DE CONTINGÊNCIA (TODAS AS COMBINAÇÕES)
// =========================================================================
const pixEstaticos = {
  25: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d520400005303986540525.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro630434A3",
  30: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d520400005303986540530.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63048591",
  35: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d520400005303986540535.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro630454BA",
  40: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d520400005303986540540.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304B5FF",
  45: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d520400005303986540545.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro630464D4",
  50: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d520400005303986540550.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304D5E6",
  55: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d520400005303986540555.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro630404CD",
  60: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d520400005303986540560.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro630475CD",
  65: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d520400005303986540565.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304A4E6",
  70: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d520400005303986540570.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro630415D4",
  75: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d520400005303986540575.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304C4FF",
  80: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d520400005303986540580.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63041511",
  85: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d520400005303986540585.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304C43A",
  90: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d520400005303986540590.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63047508",
  95: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d520400005303986540595.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304A423",
  100: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406100.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63049206",
  105: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406105.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304432D",
  110: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406110.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304F21F",
  115: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406115.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63042334",
  120: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406120.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63045234",
  125: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406125.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304831F",
  130: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406130.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304322D",
  140: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406140.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63040243",
  150: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406150.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304625A",
  160: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406160.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304C271",
  170: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406170.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304A268",
  180: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406180.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304A2AD",
  190: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406190.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304C2B4",
  200: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406200.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63040CEC",
  210: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406210.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63046CF5",
  220: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406220.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304CCDE",
  230: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406230.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304ACC7",
  240: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406240.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63049CA9",
  250: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406250.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304FCB0",
  260: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406260.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63045C9B",
  270: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406270.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63043C82",
  280: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406280.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63043C47",
  290: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406290.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63045C5E",
  300: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406300.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304794A",
  310: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406310.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63041953",
  320: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406320.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304B978",
  330: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406330.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304D961",
  340: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406340.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304E90F",
  350: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406350.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63048916",
  400: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406400.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63042119",
  410: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406410.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63044100",
  420: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406420.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304E12B",
  430: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406430.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63048132",
  440: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406440.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304B15C",
  450: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406450.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304D145",
  500: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406500.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro630454BF",
  510: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406510.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro630434A6",
  520: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406520.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304948D",
  530: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406530.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304F494",
  540: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406540.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304C4FA",
  550: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406550.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304A4E3",
  600: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406600.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304CA55",
  610: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406610.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304AA4C",
  620: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406620.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63040A67",
  630: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406630.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63046A7E",
  640: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406640.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63045A10",
  650: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406650.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63043A09",
  750: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406750.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63044FAF",
  760: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406760.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304EF84",
  770: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406770.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63048F9D",
  780: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406780.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63048F58",
  790: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406790.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304EF41",
  800: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406800.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63047AF3",
  900: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406900.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63040F55",
  910: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406910.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63046F4C",
  920: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406920.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304CF67",
  930: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406930.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304AF7E",
  940: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406940.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63049F10",
  950: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d5204000053039865406950.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304FF09",
  1000: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654071000.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304266B",
  1010: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654071010.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63044672",
  1020: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654071020.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304E659",
  1030: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654071030.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63048640",
  1040: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654071040.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304B62E",
  1050: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654071050.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304D637",
  2000: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654072000.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304AE1C",
  2010: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654072010.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304CE05",
  2020: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654072020.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63046E2E",
  2030: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654072030.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63040E37",
  2040: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654072040.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63043E59",
  2050: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654072050.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63045E40",
  3000: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654073000.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304262E",
  3010: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654073010.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63044637",
  3020: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654073020.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304E61C",
  3030: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654073030.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63048605",
  3040: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654073040.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304B66B",
  3050: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654073050.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304D672",
  4000: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654074000.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304AED3",
  4010: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654074010.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304CECA",
  4020: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654074020.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63046EE1",
  4030: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654074030.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63040EF8",
  4040: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654074040.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63043E96",
  4050: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654074050.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro63045E8F",
  5000: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654075000.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro630426E1",
  5010: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654075010.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro630446F8",
  5020: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654075020.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304E6D3",
  5030: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654075030.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro630486CA",
  5040: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654075040.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304B6A4",
  5050: "00020126580014BR.GOV.BCB.PIX0136fb65850b-e6de-474c-82b3-ae99eaa2222d52040000530398654075050.005802BR5914Diogenes Costa6007Atibaia62210517Abrigoportoseguro6304D6BD"
};

export default function Home() {
  // =========================================================================
  // CHAVE LIGA/DESLIGA DA CONTINGÊNCIA
  // =========================================================================
  const MODO_ESTATICO_EMERGENCIA = true; // Deixe true enquanto a API estiver banida
  // =========================================================================

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
    if (!viewContentFired.current) {
      firePixel('ViewContent', { content_name: 'Página de Doação', currency: 'BRL', value: 0 }, { eventID: generateId('vc') });
      viewContentFired.current = true;
    }
  }, []);

  // Radar de pagamento (Desativado no modo estático)
  useEffect(() => {
    let interval;
    if (!MODO_ESTATICO_EMERGENCIA && pixData?.transactionId && !isPaid) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/status?id=${pixData.transactionId}`);
          const data = await res.json();
          if (data.status === 'confirmed') {
            setIsPaid(true);
            firePixel('Purchase', { value: totalAmount, currency: 'BRL' }, { eventID: pixData.transactionId });
            clearInterval(interval);
          }
        } catch (e) { console.error("Erro no polling"); }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [pixData, isPaid, totalAmount, MODO_ESTATICO_EMERGENCIA]);

  const handleSelectValue = (val) => {
    setBaseValue(val);
    setBumpValue(0);
    setIsOrderbumpOpen(true);
  };

  const handleFinalize = async () => {
    setIsOrderbumpOpen(false);
    setIsPixOpen(true);

    // Dispara o InitiateCheckout assim que abrir a tela do Pix
    firePixel('InitiateCheckout', { value: totalAmount, currency: 'BRL' }, { eventID: generateId('ic') });

    // FLUXO ESTATÍCO DE EMERGÊNCIA (Puxando o Dicionário)
    if (MODO_ESTATICO_EMERGENCIA) {
      const codigoPixSelecionado = pixEstaticos[totalAmount];

      if (!codigoPixSelecionado) {
        alert("Ocorreu um erro ao carregar este valor. Por favor, feche e tente selecionar outra quantia.");
        setIsPixOpen(false);
        return;
      }

      const mockTransId = generateId('static');
      setPixData({
        qrcode: codigoPixSelecionado,
        transactionId: mockTransId
      });
      
      firePixel('AddPaymentInfo', { value: totalAmount, currency: 'BRL', payment_method: 'pix' }, { eventID: `api_${mockTransId}` });
      return; 
    }

    // FLUXO NORMAL DA API (Quando voltar para false)
    setLoading(true);
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
        firePixel('AddPaymentInfo', { value: totalAmount, currency: 'BRL', payment_method: 'pix' }, { eventID: `api_${transId}` });
      } else {
        alert("Ocorreu uma instabilidade na geração do Pix. Por favor, tente novamente em alguns instantes.");
        setIsPixOpen(false);
      }
    } catch (error) { 
      alert("Erro de conexão. Verifique sua internet."); 
      setIsPixOpen(false);
    }
    finally { setLoading(false); }
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

      {/* QUADRO DE DOAÇÃO, PERSONALIZADA E FAQ */}
      <section id="doacao" className="relative z-20 max-w-5xl mx-auto px-4 -mt-32 mb-16">
        <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] p-6 md:p-12 pb-16">
          
          <div className="text-center mb-10 mt-4">
            <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">1. Escolha o valor da sua doação</h3>
            <p className="text-gray-500 text-base mt-2">Todo valor ajuda a encher uma barriguinha.</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-16">
            {values.map((val) => (
              <button key={val} onClick={() => handleSelectValue(val)} className="border border-gray-200 rounded-xl py-3.5 text-[15px] font-bold text-gray-700 hover:border-[#00C853] hover:text-[#00C853] hover:bg-[#F2FCF5] transition-all">
                R$ {val}
              </button>
            ))}
          </div>

          {/* SEÇÃO DE DOAÇÃO PERSONALIZADA COM CHAVE PIX */}
          <div className="bg-[#FFFDF5] border border-[#FDEBCE] rounded-3xl p-8 md:p-10 mb-16 text-center shadow-sm relative">
            <div className="flex items-center justify-center gap-2 text-[#D37D00] font-black text-xl mb-3">
              <Heart size={24} className="fill-[#D37D00]" /> Doar um valor personalizado
            </div>
            <p className="text-gray-600 text-base mb-8 max-w-lg mx-auto">
              Você pode escolher doar um valor personalizado transferindo qualquer quantia diretamente para a nossa chave Pix aleatória segura.
            </p>

            <div className="max-w-md mx-auto bg-white border border-[#FDEBCE] p-6 rounded-2xl shadow-sm">
              <span className="text-xs font-black text-gray-400 mb-3 tracking-widest uppercase block">
                Chave Pix Aleatória
              </span>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base text-gray-700 font-mono break-all mb-4 select-all text-center">
                fb65850b-e6de-474c-82b3-ae99eaa2222d
              </div>
              
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6 bg-gray-50 py-2 px-4 rounded-full w-fit mx-auto border border-gray-200">
                <ShieldCheck size={18} className="text-[#00C853]" /> 
                <span>Recebedor: <strong className="text-gray-900 font-bold">Diógenes Costa</strong></span>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText("fb65850b-e6de-474c-82b3-ae99eaa2222d");
                  
                  // Dispara o LEAD com segurança
                  firePixel('Lead', { content_name: 'Cópia Chave Personalizada', currency: 'BRL' }, { eventID: generateId('lead_custom') });
                  
                  setTimeout(() => alert("Chave Pix copiada com sucesso!"), 500);
                }}
                className="w-full flex items-center justify-center bg-[#E67300] hover:bg-[#CC6600] text-white font-bold py-4 px-8 rounded-xl transition-all shadow-md gap-2 text-lg hover:scale-[1.02]"
              >
                <Copy size={20} /> Copiar Chave Pix
              </button>
            </div>
          </div>

          {/* PERGUNTAS FREQUENTES (FAQ) - REFEITO E POLIDO */}
          <div className="max-w-3xl mx-auto border-t border-gray-100 pt-14 mt-10">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-2 text-[#1976D2] font-black text-2xl mb-2">
                <AlertCircle size={24} /> Perguntas Frequentes
              </div>
              <p className="text-gray-500 text-base">Transparência é o nosso maior compromisso com você e com os animais.</p>
            </div>
            
            <div className="space-y-4">
              <details className="group border border-gray-200 rounded-2xl bg-white cursor-pointer hover:border-[#1976D2] transition-colors shadow-sm [&::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between p-6 font-bold text-[17px] text-gray-800 outline-none list-none">
                  Para onde vai o dinheiro da minha doação?
                  <span className="bg-gray-50 p-2 rounded-full group-open:bg-[#E6F0FF] transition-colors">
                    <ChevronDown size={20} className="text-gray-500 group-open:text-[#1976D2] group-open:rotate-180 transition-transform duration-300" />
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600 text-base leading-relaxed border-t border-gray-100 pt-4 mt-2">
                  100% do valor é destinado diretamente para o custeio do abrigo. Isso inclui: compra de ração, medicamentos e cirurgias veterinárias.
                </div>
              </details>

              <details className="group border border-gray-200 rounded-2xl bg-white cursor-pointer hover:border-[#1976D2] transition-colors shadow-sm [&::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between p-6 font-bold text-[17px] text-gray-800 outline-none list-none">
                  É seguro doar através do site?
                  <span className="bg-gray-50 p-2 rounded-full group-open:bg-[#E6F0FF] transition-colors">
                    <ChevronDown size={20} className="text-gray-500 group-open:text-[#1976D2] group-open:rotate-180 transition-transform duration-300" />
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600 text-base leading-relaxed border-t border-gray-100 pt-4 mt-2">
                  Sim, totalmente seguro. O pagamento é processado via Pix de forma criptografada diretamente pelo sistema do Banco Central.
                </div>
              </details>
            </div>
          </div>

        </div>
      </section>

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

      {/* MODAL PIX COM SUPORTE A MODO ESTÁTICO E TRANSPARÊNCIA */}
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
                  <h3 className="text-2xl font-extrabold text-center text-gray-900 mb-3 tracking-tight">Gere seu Pix Agora</h3>
                  
                  {/* BADGE DE SEGURANÇA COM O NOME DO RECEBEDOR */}
                  <div className="flex items-center justify-center gap-1.5 text-sm text-gray-600 mb-5 bg-gray-50 py-1.5 px-4 rounded-full w-fit mx-auto border border-gray-200">
                    <ShieldCheck size={16} className="text-[#00C853]" /> Recebedor: <strong className="text-gray-900">Diógenes Costa</strong>
                  </div>

                  <p className="text-center text-gray-600 mb-8 text-sm">Escaneie o código ou use o botão para doar <strong className="text-gray-900 text-lg">R$ {totalAmount.toFixed(2).replace('.', ',')}</strong>.</p>
                  
                  <div className="flex flex-col md:flex-row gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold text-gray-400 mb-3 tracking-widest uppercase">Escanear QR Code</span>
                      <QRCodeSVG value={String(qrText)} size={192} className="mb-4 border-4 border-white rounded-2xl p-2 bg-white shadow-md" includeMargin={true} />
                    </div>
                    <div className="w-px h-40 bg-gray-200 hidden md:block"></div>
                    <div className="flex-1 flex flex-col justify-center">
                      <span className="text-[10px] font-bold text-gray-400 mb-2 tracking-widest uppercase">Pix Copia e Cola</span>
                      <div className="border border-gray-200 rounded-lg p-3 bg-white text-[11px] text-gray-500 font-mono break-all h-24 overflow-hidden relative mb-4 shadow-sm">
                        {qrText}
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(qrText);
                          
                          // Dispara o Purchase
                          firePixel('Purchase', { value: totalAmount, currency: 'BRL' }, { eventID: pixData?.transactionId || generateId('cp') });
                          
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
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}