export const DateUtils = {
  // Força a data para o início absoluto do dia em UTC (00:00:00.000)
  // uso: startDate, nextBilling
  inicioDiaUTC(date: Date): Date {
    const novaData = new Date(date);
    novaData.setUTCHours(0, 0, 0, 0);
    return novaData;
  },

  // Força a data para o último milissegundo do dia em UTC (23:59:59.999)
  // uso: endDate (acesso até o último segundo)
  fimDiaUTC(date: Date): Date {
    const novaData = new Date(date);
    novaData.setUTCHours(23, 59, 59, 999);
    return novaData;
  },
};
