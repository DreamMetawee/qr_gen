function formatPromptPayID(id: string): string {
  if (id.length === 10 && id.startsWith("0")) {
    return id; // ไม่ใส่ "66"
  }
  return id;
}

function encodeTLV(id: string, amountBaht?: number): string {
  const payload = [
    ["00", "01"], // Payload format indicator
    ["01", "11"], // Point of initiation (dynamic)
    [
      "29",
      [
        // Merchant Account Info
        ["00", "A000000677010111"],
        ["01", formatPromptPayID(id)],
      ],
    ],
    ["52", "0000"], // Merchant category code
    ["53", "764"], // THB
    ["58", "TH"], // Country
    ["59", "Name"], // Optional: Merchant name
    ["60", "Bangkok"], // Optional: City
  ];

  if (amountBaht !== undefined) {
    const amountStr = amountBaht.toFixed(2);
    payload.push(["54", amountStr]);
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

  // Add CRC placeholder
  result += "6304";

  // Calculate CRC
  const crc = crc16(result);
  return result + crc;
}

function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
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
