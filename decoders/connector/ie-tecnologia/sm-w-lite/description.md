# IE Tecnologia SM-W Lite

Medidor de energia monofásico para monitoramento de parâmetros elétricos.

## Parâmetros Medidos

- **Potência Ativa** (W)
- **Potência Reativa** (VAr)
- **Potência Aparente** (VA)
- **Tensão** (V)
- **Corrente** (A)
- **Fator de Potência**
- **Ângulo de Fase** (°) — ângulo entre tensão e corrente
- **Frequência** (Hz)
- **Consumo de Energia Ativa** (kWh)
- **Geração de Energia Ativa** (kWh)
- **Temperatura do Equipamento** (°C)
- **Intensidade do Sinal Wi-Fi** (dBm)

## Formato do Payload

O SM-W Lite transmite um objeto JSON com 13 campos usando nomes curtos (ex: `pa`, `uarms`, `freq`). Todos os valores são enviados como strings. O decoder converte esses campos em variáveis individuais no formato TagoIO com nomes descritivos e unidades corretas.