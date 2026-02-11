import { describe, expect, test} from "vitest";
import { DataToSend } from "@tago-io/sdk/lib/types";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/zenmeasure/mot-g102/v1.0.0/payload.ts"; 

describe("Shall not be parsed", () => {
  let payload = [
    { variable: "shallnotpass", value: "04096113950292" },
    { variable: "fport", value: 9 },
  ];
  payload = decoderRun(file_path, { payload });
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([
      { variable: "shallnotpass", value: "04096113950292" },
      { variable: "fport", value: 9 },
    ]);
  });
});
describe("Shall be parsed ", () => {
  test("解析 MOT-G102 设备的多个BLE设备扫描数据", () => {
    const payloadData = {
      v: 1011,
      devices: [
        [0, "FE9770202823", -32, "020106030209181716C4C1FE9770202823B679EC68CABA0000033CAF01000A"]
      ],
      time: 1770703750,
      model: "MOT-G102",
      type: 0,
      id: "G102_404CCA6D3D19"
    };

  let payload = [
    { variable: "payload", value: JSON.stringify(payloadData) },
  ];
    
    const result = decoderRun(file_path, { payload });
    
    result.forEach(item => {
    expect(item).toHaveProperty("variable");
    expect(item).toHaveProperty("value");
    const data = JSON.parse(item.value);
    expect(data.model).toBe("MOT-G102");
    expect(data.v).toBe(1011);
    expect(data.devices[0][1]).toBe("FE9770202823");


});

});
});
