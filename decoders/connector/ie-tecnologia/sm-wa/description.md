# IE Tecnologia SM-WA

Medidor de consumo de água com monitoramento de vazão instantânea e consumo acumulado.

## Parâmetros Medidos

- **Pulsos por Litro** (pulsos/L) — configuração do sensor
- **Vazão Instantânea** (L/min) — calculada com base nos pulsos
- **Consumo Total Acumulado** (Litros)
- **Intensidade do Sinal Wi-Fi** (dBm)

## Formato do Payload

O SM-WA transmite um objeto JSON com 5 campos usando nomes curtos (ex: `ppl`, `vazao`, `consumo`). Todos os valores são enviados como strings. O decoder converte esses campos em variáveis individuais no formato TagoIO com nomes descritivos e unidades corretas.