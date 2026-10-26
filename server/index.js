import 'dotenv/config';
import { app } from './app.js';

const port = Number(process.env.PORT || 3000);

app.listen(port, '0.0.0.0', () => {
  console.log(`[academix] API e SPA disponíveis na porta ${port}`);
  console.log(`[academix] modo do assistente: ${(process.env.LLM_MODE || 'demo').toLowerCase()}`);
});
