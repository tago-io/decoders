##IE TECNOLOGIA
# IE Tecnologia SM-WT

Medidor de temperatura e umidade com suporte aos sensores SHT40 e DS18B20.

## Parâmetros Medidos

- **Temperatura** (°C) — canal 1 (SHT40 ou DS18B20)
- **Umidade Relativa** (%rH) — canal 1 (somente com sensor SHT40)

## Formato do Payload

O SM-WT transmite um objeto JSON com 2 ou 3 campos dependendo do sensor utilizado. Com o sensor SHT40, envia temperatura e umidade. Com o sensor DS18B20, envia apenas temperatura. Todos os valores são enviados como strings.