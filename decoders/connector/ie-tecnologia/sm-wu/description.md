# IE Tecnologia SM-WU

Medidor ultrassônico de nível e volume para reservatórios e tanques.

## Parâmetros Medidos

- **Distância** (cm) — distância do sensor até a superfície do nível atual
- **Nível** (cm) — nível calculado de acordo com configurações do equipamento
- **Volume** (L) — volume calculado de acordo com configurações do equipamento
- **Intensidade do Sinal Wi-Fi** (dBm)

## Formato do Payload

O SM-WU transmite um objeto JSON com 4 campos usando nomes curtos (ex: `d`, `nivel`, `volume`). Todos os valores são enviados como strings. O decoder converte esses campos em variáveis individuais no formato TagoIO com nomes descritivos e unidades corretas.