# IE Tecnologia SM-3W

Medidor de energia trifásico para monitoramento de parâmetros elétricos nas três fases (A, B, C).

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
- **Geração de Energia Ativa** (kWh) — fases A, B, C e total
- **Ângulos entre Tensões de Fase** (°) — A-B, A-C, B-C
- **Temperatura do Equipamento** (°C)

## Formato do Payload

O SM-3W transmite um objeto JSON com 40 campos usando nomes curtos (ex: `pa`, `uarms`, `freq`). Todos os valores são enviados como strings. O decoder converte esses campos em variáveis individuais no formato TagoIO com nomes descritivos e unidades corretas.