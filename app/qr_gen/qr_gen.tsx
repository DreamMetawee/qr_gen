"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

function encodePromptPayPayload(id: string, amountBaht?: number): string {
  const payload: [string, string | [string, string][]][] = [
    ["00", "01"],
    ["01", "11"],
    [
      "29",
      [
        ["00", "A000000677010111"],
        ["01", formatPromptPayID(id)],
      ],
    ],
    ["52", "0000"],
    ["53", "764"],
    ["58", "TH"],
    ["59", "Merchant"],
    ["60", "Bangkok"],
  ];

  if (amountBaht !== undefined) {
    payload.push(["54", amountBaht.toFixed(2)]);
  }

  let result = "";
  for (const [tag, value] of payload) {
    if (Array.isArray(value)) {
      let inner = "";
      for (const [innerTag, innerValue] of value) {
        inner += `${innerTag}${innerValue.length
          .toString()
          .padStart(2, "0")}${innerValue}`;
      }
      result += `${tag}${inner.length.toString().padStart(2, "0")}${inner}`;
    } else {
      result += `${tag}${value.length.toString().padStart(2, "0")}${value}`;
    }
  }

  result += "6304"; // CRC Placeholder
  return result + calculateCRC(result);
}

function calculateCRC(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

const QrGenerator = () => {
  const [qrData, setQrData] = useState("");

  useEffect(() => {
    const payload = encodePromptPayPayload("0983433530", 0.01); // เบอร์ PromptPay + จำนวนเงิน
    QRCode.toDataURL(payload)
      .then(setQrData)
      .catch((err) => console.error("QR Encode Error:", err));
  }, []);

  return (
    <div className="flex flex-col items-center mt-10">
      <h1 className="text-xl font-bold mb-4">PromptPay QR</h1>
      {qrData ? (
        <img src={qrData} alt="PromptPay QR Code" className="w-60 h-60" />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default QrGenerator;
