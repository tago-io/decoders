# IE Tecnologia SM-WRC

Controlador de relé com monitoramento de estado e intensidade de sinal Wi-Fi.

## Parâmetros Medidos

- **Estado do Relé** — 0: desligado, 1: ligado
- **Intensidade do Sinal Wi-Fi** (dBm)

## Formato do Payload

O SM-WRC transmite um objeto JSON com 3 campos usando nomes curtos (ex: `er`, `rssi`). Todos os valores são enviados como strings. O decoder converte esses campos em variáveis individuais no formato TagoIO com nomes descritivos e unidades corretas.