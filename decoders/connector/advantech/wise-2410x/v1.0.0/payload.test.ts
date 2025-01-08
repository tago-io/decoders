import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/advantech/wise-2410/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex) {
  let payload = [{ variable: "payload", value: payloadHex }];
  payload = decoderRun(file_path, { payload });
  //y axis
  const accelerometer_y_axis_senevent = payload.find((item) => item.variable === "accelerometer_y_axis_senevent");
  const accelerometer_y_axis_crestfactor = payload.find((item) => item.variable === "accelerometer_y_axis_crestfactor");
  const accelerometer_y_axis_kurtosis = payload.find((item) => item.variable === "accelerometer_y_axis_kurtosis");
  const accelerometer_y_axis_rms = payload.find((item) => item.variable === "accelerometer_y_axis_rms");
  const accelerometer_y_axis_peak = payload.find((item) => item.variable === "accelerometer_y_axis_peak");
  const accelerometer_y_axis_oavelocity = payload.find((item) => item.variable === "accelerometer_y_axis_oavelocity");
  const accelerometer_y_axis_skewness = payload.find((item) => item.variable === "accelerometer_y_axis_skewness");
  const accelerometer_y_axis_deviation = payload.find((item) => item.variable === "accelerometer_y_axis_deviation");
  const accelerometer_y_axis_peak_to_peak_displacement = payload.find((item) => item.variable === "accelerometer_y_axis_peak_to_peak_displacement");
  //x axis
  const accelerometer_x_axis_senevent = payload.find((item) => item.variable === "accelerometer_x_axis_senevent");
  const accelerometer_x_axis_crestfactor = payload.find((item) => item.variable === "accelerometer_x_axis_crestfactor");
  const accelerometer_x_axis_kurtosis = payload.find((item) => item.variable === "accelerometer_x_axis_kurtosis");
  const accelerometer_x_axis_rms = payload.find((item) => item.variable === "accelerometer_x_axis_rms");
  const accelerometer_x_axis_peak = payload.find((item) => item.variable === "accelerometer_x_axis_peak");
  const accelerometer_x_axis_oavelocity = payload.find((item) => item.variable === "accelerometer_x_axis_oavelocity");
  const accelerometer_x_axis_skewness = payload.find((item) => item.variable === "accelerometer_x_axis_skewness");
  const accelerometer_x_axis_deviation = payload.find((item) => item.variable === "accelerometer_x_axis_deviation");
  const accelerometer_x_axis_peak_to_peak_displacement = payload.find((item) => item.variable === "accelerometer_x_axis_peak_to_peak_displacement");
  //z axis
  const accelerometer_z_axis_senevent = payload.find((item) => item.variable === "accelerometer_z_axis_senevent");
  const accelerometer_z_axis_crestfactor = payload.find((item) => item.variable === "accelerometer_z_axis_crestfactor");
  const accelerometer_z_axis_kurtosis = payload.find((item) => item.variable === "accelerometer_z_axis_kurtosis");
  const accelerometer_z_axis_rms = payload.find((item) => item.variable === "accelerometer_z_axis_rms");
  const accelerometer_z_axis_peak = payload.find((item) => item.variable === "accelerometer_z_axis_peak");
  const accelerometer_z_axis_oavelocity = payload.find((item) => item.variable === "accelerometer_z_axis_oavelocity");
  const accelerometer_z_axis_skewness = payload.find((item) => item.variable === "accelerometer_z_axis_skewness");
  const accelerometer_z_axis_deviation = payload.find((item) => item.variable === "accelerometer_z_axis_deviation");
  const accelerometer_z_axis_peak_to_peak_displacement = payload.find((item) => item.variable === "accelerometer_z_axis_peak_to_peak_displacement");

  const temphumi_senval = payload.find((item) => item.variable === "temphumi_senval");
  const temphumi_event = payload.find((item) => item.variable === "temphumi_event");
  const temphumi_status = payload.find((item) => item.variable === "temphumi_status");
  const temphumi_range = payload.find((item) => item.variable === "temphumi_range");

  const accelerometer_time = payload.find((item) => item.variable === "accelerometer_time");
  const accelerometer_logindex = payload.find((item) => item.variable === "accelerometer_logindex");
  const device_batteryvolt = payload.find((item) => item.variable === "device_batteryvolt");
  const device_powersrc = payload.find((item) => item.variable === "device_powersrc");
  const device_events = payload.find((item) => item.variable === "device_events");

  const parse_error = payload.find((item) => item.variable === "parse_error");
  return {
    payload,
    accelerometer_y_axis_senevent,
    accelerometer_y_axis_crestfactor,
    accelerometer_y_axis_kurtosis,
    accelerometer_y_axis_rms,
    accelerometer_y_axis_peak,
    accelerometer_y_axis_oavelocity,
    accelerometer_y_axis_skewness,
    accelerometer_y_axis_deviation,
    accelerometer_y_axis_peak_to_peak_displacement,
    accelerometer_x_axis_senevent,
    accelerometer_x_axis_crestfactor,
    accelerometer_x_axis_kurtosis,
    accelerometer_x_axis_rms,
    accelerometer_x_axis_peak,
    accelerometer_x_axis_oavelocity,
    accelerometer_x_axis_peak_to_peak_displacement,
    accelerometer_x_axis_skewness,
    accelerometer_x_axis_deviation,
    accelerometer_z_axis_senevent,
    accelerometer_z_axis_crestfactor,
    accelerometer_z_axis_kurtosis,
    accelerometer_z_axis_rms,
    accelerometer_z_axis_peak,
    accelerometer_z_axis_oavelocity,
    accelerometer_z_axis_peak_to_peak_displacement,
    accelerometer_z_axis_skewness,
    accelerometer_z_axis_deviation,
    temphumi_senval,
    temphumi_event,
    temphumi_status,
    temphumi_range,
    accelerometer_time,
    accelerometer_logindex,
    device_batteryvolt,
    device_powersrc,
    device_events,
    parse_error,
  };
}

describe("Axis", () => {
  test("should decode the payload correctly", () => {
    const payloadHex = "817a585008070000001e7800005441e2ff0000100015000f000c0007021b000200040000001f001a001300feff9d011d000200090000001a001a001300f4ff8b01fbff0200070003000000000f6c016660091b00010000106c016696";
    const result = preparePayload(payloadHex);

    expect(result.accelerometer_y_axis_senevent?.value).toBe(0);
    expect(result.accelerometer_y_axis_crestfactor?.value).toBe(4.13);
    expect(result.accelerometer_y_axis_kurtosis?.value).toBe(-0.02);
    expect(result.accelerometer_y_axis_rms?.value).toBe(0.019);
    expect(result.accelerometer_y_axis_peak?.value).toBe(0.026);
    expect(result.accelerometer_y_axis_oavelocity?.value).toBe(0.31);
    expect(result.accelerometer_y_axis_skewness?.value).toBe(0.29);
    expect(result.accelerometer_y_axis_deviation?.value).toBe(0.02);
    expect(result.accelerometer_y_axis_peak_to_peak_displacement?.value).toBe(9);

    expect(result.accelerometer_x_axis_senevent?.value).toBe(0);
    expect(result.accelerometer_x_axis_crestfactor?.value).toBe(5.19);
    expect(result.accelerometer_x_axis_kurtosis?.value).toBe(0.12);
    expect(result.accelerometer_x_axis_rms?.value).toBe(0.015);
    expect(result.accelerometer_x_axis_peak?.value).toBe(0.021);
    expect(result.accelerometer_x_axis_oavelocity?.value).toBe(0.16);
    expect(result.accelerometer_x_axis_skewness?.value).toBe(0.27);
    expect(result.accelerometer_x_axis_deviation?.value).toBe(0.02);
    expect(result.accelerometer_x_axis_peak_to_peak_displacement?.value).toBe(4);

    expect(result.accelerometer_z_axis_senevent?.value).toBe(0);
    expect(result.accelerometer_z_axis_crestfactor?.value).toBe(3.95);
    expect(result.accelerometer_z_axis_kurtosis?.value).toBe(-0.12);
    expect(result.accelerometer_z_axis_rms?.value).toBe(0.019);
    expect(result.accelerometer_z_axis_peak?.value).toBe(0.026);
    expect(result.accelerometer_z_axis_oavelocity?.value).toBe(0.26);
    expect(result.accelerometer_z_axis_skewness?.value).toBe(-0.05);
    expect(result.accelerometer_z_axis_deviation?.value).toBe(0.02);
    expect(result.accelerometer_z_axis_peak_to_peak_displacement?.value).toBe(7);

    expect(result.temphumi_senval?.value).toBe(30.75);
    expect(result.temphumi_event?.value).toBe(0);
    expect(result.temphumi_status?.value).toBe(0);
    expect(result.temphumi_range?.value).toBe(0);

    expect(result.accelerometer_time?.value).toBe(1711369231);
    expect(result.accelerometer_logindex?.value).toBe(0);
    expect(result.device_batteryvolt?.value).toBe(0);
    expect(result.device_powersrc?.value).toBe(1);
    expect(result.device_events?.value).toBe(0);
  });
});

describe("Shall not be parsed", () => {
  let payload = [{ variable: "shallnotpass", value: "04096113950292" }];
  payload = decoderRun(file_path, { payload });

  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([{ variable: "shallnotpass", value: "04096113950292" }]);
  });
});
