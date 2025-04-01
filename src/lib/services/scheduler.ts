import { checkAndSendReminders } from './reminderService';

export const startReminderScheduler = () => {
  console.log('Iniciando serviço de lembretes...', new Date().toLocaleString());
  
  const scheduleNextReminder = () => {
    const now = new Date();
    const nextRun = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      10, // 10:00
      0,  // 0 minutos
      0
    );

    // Se já passou das 10:00 hoje, agende para amanhã
    if (now >= nextRun) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const timeUntilNextRun = nextRun.getTime() - now.getTime();

    console.log(`Próxima verificação agendada para: ${nextRun.toLocaleString()}`);
    console.log(`Tempo até próxima execução: ${Math.floor(timeUntilNextRun / 1000 / 60)} minutos`);

    setTimeout(async () => {
      try {
        console.log('Iniciando verificação de lembretes:', new Date().toLocaleString());
        const results = await checkAndSendReminders();
        console.log('Verificação de lembretes concluída com sucesso');
        console.log('Lembretes enviados:', results?.length || 0);
      } catch (error) {
        console.error('Erro ao executar verificação de lembretes:', error);
      } finally {
        // Agenda a próxima execução
        scheduleNextReminder();
      }
    }, timeUntilNextRun);
  };

  // Verifica se deve executar agora (para teste)
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  if (currentHour === 10 && currentMinute === 0) {
    console.log('Executando verificação imediata...');
    checkAndSendReminders().then(() => {
      console.log('Verificação imediata concluída');
    }).catch(error => {
      console.error('Erro na verificação imediata:', error);
    });
  }

  // Inicia o agendamento
  scheduleNextReminder();
};

// Função para executar verificação manual
export const runManualCheck = async () => {
  try {
    console.log('Iniciando verificação manual:', new Date().toLocaleString());
    const result = await checkAndSendReminders();
    console.log('Verificação manual concluída:', new Date().toLocaleString());
    return result;
  } catch (error) {
    console.error('Erro na verificação manual:', error);
    throw error;
  }
}; 