function field(id: string, value: string): string {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function sanitize(value: string, max: number): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 .-]/g, "")
    .trim()
    .slice(0, max)
    .toUpperCase();
}

export type PixPayload = {
  copyPaste: string;
  txid: string;
  amountCents: number;
};

export function buildPixPayload(input: {
  key: string;
  merchantName: string;
  merchantCity: string;
  amountCents: number;
  txid: string;
}): PixPayload {
  const amount = (input.amountCents / 100).toFixed(2);
  const merchantAccount = field(
    "00",
    "BR.GOV.BCB.PIX",
  ) + field("01", input.key);
  const payload =
    field("00", "01") +
    field("26", merchantAccount) +
    field("52", "0000") +
    field("53", "986") +
    field("54", amount) +
    field("58", "BR") +
    field("59", sanitize(input.merchantName, 25)) +
    field("60", sanitize(input.merchantCity, 15)) +
    field("62", field("05", sanitize(input.txid, 25))) +
    "6304";
  return {
    copyPaste: `${payload}${crc16(payload)}`,
    txid: input.txid,
    amountCents: input.amountCents,
  };
}
