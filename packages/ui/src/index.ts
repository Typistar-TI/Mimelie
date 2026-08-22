export const brandTokens = {
  color: { background: '#FEFBF3', backgroundSoft: '#FBEBDC', primary: '#9F4D4D', petal: '#EDBFB3', copper: '#C3866B', foreground: '#542A30', border: '#EEC0A2' },
  font: { display: 'Cormorant Garamond', body: 'Nunito Sans' },
} as const;
export const formatBRL = (cents: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
