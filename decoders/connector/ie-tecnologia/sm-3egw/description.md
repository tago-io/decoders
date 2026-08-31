# IE Tecnologia SM-3EGW

Medidor de energia trifásico com conectividade WiFi, Ethernet e GSM para monitoramento completo de parâmetros elétricos nas três fases (A, B, C).

## Parâmetros Medidos

- **Tensão** (V) — fases A, B, C
- **Corrente** (A) — fases A, B, C e total
- **Potência Ativa** (W) — fases A, B, C e total
- **Potência Reativa** (VAr) — fases A, B, C e total
- **Potência Aparente** (VA) — fases A, B, C e total
- **Fator de Potência** — fases A, B, C e total
- **Ângulo de Fase** (°) — ângulo entre tensão e corrente por fase
- **Frequência** (Hz)
- **Consumo de Energia Ativa** (kWh) — fases A, B, C e total
- **Consumo de Energia Reativa** (kVArh) — fases A, B, C e total
- **Geração de Energia Ativa** (kWh) — fases A, B, C e total
- **Geração de Energia Reativa** (kVArh) — fases A, B, C e total
- **Delta de Energia** — diferença entre última e atual telemetria (ativa e reativa, consumo e geração)
- **Ângulos entre Tensões de Fase** (°) — A-B, A-C, B-C
- **Temperatura do Equipamento** (°C)
- **Tipo de Conexão** — 1: WiFi, 2: Ethernet, 3: GSM
- **Intensidade do Sinal Wi-Fi** (dBm)
- **Intensidade do Sinal GSM** (dBm)

## Formato do Payload

O SM-3EGW transmite um objeto JSON com 67 campos usando nomes curtos (ex: `pa`, `uarms`, `freq`, `deltaepac`). Todos os valores são enviados como strings. O decoder converte esses campos em variáveis individuais no formato TagoIO com nomes descritivos e unidades corretas.