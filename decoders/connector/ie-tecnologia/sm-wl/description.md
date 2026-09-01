# IE Tecnologia SM-WL

Medidor de energia monofásico com monitoramento de energia ativa e reativa, consumo e geração, com rastreamento de delta entre telemetrias.

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
- **Consumo de Energia Reativa** (kVArh)
- **Geração de Energia Ativa** (kWh)
- **Geração de Energia Reativa** (kVArh)
- **Delta de Energia** — diferença entre última e atual telemetria (ativa e reativa, consumo e geração)
- **Temperatura do Equipamento** (°C)
- **Intensidade do Sinal Wi-Fi** (dBm)

## Formato do Payload

O SM-WL transmite um objeto JSON com 19 campos usando nomes curtos (ex: `pa`, `uarms`, `freq`, `delta_epa_c`). Todos os valores são enviados como strings. O decoder converte esses campos em variáveis individuais no formato TagoIO com nomes descritivos e unidades corretas.