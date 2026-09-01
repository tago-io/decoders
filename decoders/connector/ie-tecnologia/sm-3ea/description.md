# IE Tecnologia SM-3EA

Medidor de corrente trifásico com monitoramento das três fases.

## Parâmetros Medidos

- **Corrente Fase A** (mA)
- **Corrente Fase B** (mA)
- **Corrente Fase C** (mA)
- **Intensidade do Sinal Wi-Fi** (dBm)

## Formato do Payload

O SM-3EA transmite um objeto JSON com 5 campos usando nomes curtos (ex: `ia`, `ib`, `ic`). Os valores são enviados como números. O decoder converte esses campos em variáveis individuais no formato TagoIO com nomes descritivos e unidades corretas.