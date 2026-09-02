# IE Tecnologia SM-W Plug

Medidor de energia monofásico com relé integrado para controle de carga.

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
- **Estado do Relé** — 0: desligado, 1: ligado
- **Intensidade do Sinal Wi-Fi** (dBm)

## Formato do Payload

O SM-W Plug transmite um objeto JSON com 12 campos usando nomes curtos (ex: `pa`, `uarms`, `freq`, `rele`). Todos os valores são enviados como strings. O decoder converte esses campos em variáveis individuais no formato TagoIO com nomes descritivos e unidades corretas.