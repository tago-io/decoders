function parsePayload(e) {
  var t = {},
    n = [],
    s = [],
    a = (function e(t) {
      for (var n = [], s = 0; s < t.length; s++) n.push(255 & _(t[s]));
      return n;
    })(e.bytes);
  (t.payload = x(a).toUpperCase()),
    (t.port = e.fPort),
    101 === e.fPort &&
      (n = [
        {
          key: [],
          fn: function (e) {
            for (var n = e.length, s = [], a = []; e.length > 0; ) {
              var r = e[0],
                i = e[1];
              if (((e = e.slice(2)), i > 0)) {
                for (var d = 0; d < i; d++) s.push("0x" + e[d].toString(16));
                (e = e.slice(i)),
                  a.push(
                    i +
                      " Invalid write command(s) from DL:" +
                      r +
                      " for register(s): " +
                      s
                  );
              } else
                a.push("All write commands from DL:" + r + "were successfull");
              s = [];
            }
            return (t.response = a), n;
          },
        },
      ]),
    10 === e.fPort &&
      (n = [
        {
          key: [0, 211],
          fn: function (e) {
            return (t.battery_lifetime_pct = b(e, 1, 7, 0, "unsigned")), 1;
          },
        },
        {
          key: [0, 189],
          fn: function (e) {
            return (t.battery_lifetime_dys = b(e, 2, 15, 0, "unsigned")), 2;
          },
        },
        {
          key: [0, 133],
          fn: function (e) {
            return (
              t.hasOwnProperty("utc") || (t.utc = {}),
              (t.utc.year_utc = b(e, 4, 31, 26, "unsigned")),
              (t.utc.month_utc = b(e, 4, 25, 22, "unsigned")),
              (t.utc.day_utc = b(e, 4, 21, 17, "unsigned")),
              (t.utc.hour_utc = b(e, 4, 16, 12, "unsigned")),
              (t.utc.minute_utc = b(e, 4, 11, 6, "unsigned")),
              (t.utc.second_utc = b(e, 4, 5, 0, "unsigned")),
              4
            );
          },
        },
        {
          key: [0, 136],
          fn: function (e) {
            return (
              t.hasOwnProperty("coordinates") || (t.coordinates = {}),
              (t.coordinates.latitude = (
                1072883606e-14 * b(e, 8, 63, 40, "signed")
              ).toFixed(7)),
              (t.coordinates.longitude = (
                2145767212e-14 * b(e, 8, 39, 16, "signed")
              ).toFixed(7)),
              (t.coordinates.altitude = (
                0.144958496 * b(e, 8, 15, 0, "unsigned") +
                -500
              ).toFixed(2)),
              8
            );
          },
        },
        {
          key: [0, 146],
          fn: function (e) {
            return (
              (t.ground_speed = (0.27778 * b(e, 1, 7, 0, "unsigned")).toFixed(
                3
              )),
              1
            );
          },
        },
        {
          key: [0, 0],
          fn: function (e) {
            return (t.gnss_fix = b(e, 1, 7, 0, "unsigned")), 1;
          },
        },
        {
          key: [0, 149],
          fn: function (e) {
            t.hasOwnProperty("gnss_status") || (t.gnss_status = {});
            var n = b(e, 1, 1, 0, "unsigned");
            switch (n) {
              case 0:
                t.gnss_status.gnss_status_dz0 = "Unknown";
                break;
              case 1:
                t.gnss_status.gnss_status_dz0 = "Inside";
                break;
              case 2:
                t.gnss_status.gnss_status_dz0 = "Outside";
                break;
              default:
                t.gnss_status.gnss_status_dz0 = "Invalid";
            }
            var n = b(e, 1, 3, 2, "unsigned");
            switch (n) {
              case 0:
                t.gnss_status.gnss_status_dz1 = "Unknown";
                break;
              case 1:
                t.gnss_status.gnss_status_dz1 = "Inside";
                break;
              case 2:
                t.gnss_status.gnss_status_dz1 = "Outside";
                break;
              default:
                t.gnss_status.gnss_status_dz1 = "Invalid";
            }
            var n = b(e, 1, 5, 4, "unsigned");
            switch (n) {
              case 0:
                t.gnss_status.gnss_status_dz2 = "Unknown";
                break;
              case 1:
                t.gnss_status.gnss_status_dz2 = "Inside";
                break;
              case 2:
                t.gnss_status.gnss_status_dz2 = "Outside";
                break;
              default:
                t.gnss_status.gnss_status_dz2 = "Invalid";
            }
            var n = b(e, 1, 7, 6, "unsigned");
            switch (n) {
              case 0:
                t.gnss_status.gnss_status_dz3 = "Unknown";
                break;
              case 1:
                t.gnss_status.gnss_status_dz3 = "Inside";
                break;
              case 2:
                t.gnss_status.gnss_status_dz3 = "Outside";
                break;
              default:
                t.gnss_status.gnss_status_dz3 = "Invalid";
            }
            return 1;
          },
        },
        {
          key: [1, 149],
          fn: function (e) {
            t.hasOwnProperty("ble_status") || (t.ble_status = {});
            var n = b(e, 1, 1, 0, "unsigned");
            switch (n) {
              case 0:
                t.ble_status.ble_status_dz0 = "Unknown";
                break;
              case 1:
                t.ble_status.ble_status_dz0 = "Inside";
                break;
              case 2:
                t.ble_status.ble_status_dz0 = "Outside";
                break;
              case 3:
                t.ble_status.ble_status_dz0 = "Near";
                break;
              default:
                t.ble_status.ble_status_dz0 = "Invalid";
            }
            var n = b(e, 1, 3, 2, "unsigned");
            switch (n) {
              case 0:
                t.ble_status.ble_status_dz1 = "Unknown";
                break;
              case 1:
                t.ble_status.ble_status_dz1 = "Inside";
                break;
              case 2:
                t.ble_status.ble_status_dz1 = "Outside";
                break;
              case 3:
                t.ble_status.ble_status_dz1 = "Near";
                break;
              default:
                t.ble_status.ble_status_dz1 = "Invalid";
            }
            var n = b(e, 1, 5, 4, "unsigned");
            switch (n) {
              case 0:
                t.ble_status.ble_status_dz2 = "Unknown";
                break;
              case 1:
                t.ble_status.ble_status_dz2 = "Inside";
                break;
              case 2:
                t.ble_status.ble_status_dz2 = "Outside";
                break;
              case 3:
                t.ble_status.ble_status_dz2 = "Near";
                break;
              default:
                t.ble_status.ble_status_dz2 = "Invalid";
            }
            var n = b(e, 1, 7, 6, "unsigned");
            switch (n) {
              case 0:
                t.ble_status.ble_status_dz3 = "Unknown";
                break;
              case 1:
                t.ble_status.ble_status_dz3 = "Inside";
                break;
              case 2:
                t.ble_status.ble_status_dz3 = "Outside";
                break;
              case 3:
                t.ble_status.ble_status_dz3 = "Near";
                break;
              default:
                t.ble_status.ble_status_dz3 = "Invalid";
            }
            return 1;
          },
        },
        {
          key: [0, 115],
          fn: function (e) {
            return (
              (t.barometric_pressure = (
                0.1 * b(e, 2, 15, 0, "unsigned")
              ).toFixed(1)),
              2
            );
          },
        },
        {
          key: [0, 116],
          fn: function (e) {
            return (
              (t.cal_barometric_pressure = (
                0.1 * b(e, 2, 15, 0, "unsigned")
              ).toFixed(1)),
              2
            );
          },
        },
        {
          key: [0, 113],
          fn: function (e) {
            return (
              t.hasOwnProperty("acceleration_vector") ||
                (t.acceleration_vector = {}),
              (t.acceleration_vector.acceleration_x = (
                0.001 * b(e, 6, 47, 32, "signed")
              ).toFixed(3)),
              (t.acceleration_vector.acceleration_y = (
                0.001 * b(e, 6, 31, 16, "signed")
              ).toFixed(3)),
              (t.acceleration_vector.acceleration_z = (
                0.001 * b(e, 6, 15, 0, "signed")
              ).toFixed(3)),
              6
            );
          },
        },
        {
          key: [0, 103],
          fn: function (e) {
            return (
              (t.temperature = (0.1 * b(e, 2, 15, 0, "signed")).toFixed(1)), 2
            );
          },
        },
        {
          key: [2, 149],
          fn: function (e) {
            t.hasOwnProperty("safety_status") || (t.safety_status = {});
            var n = b(e, 1, 0, 0, "unsigned");
            switch (n) {
              case 0:
                t.safety_status.safety_status_eb = "Inactive";
                break;
              case 1:
                t.safety_status.safety_status_eb = "Active";
                break;
              default:
                t.safety_status.safety_status_eb = "Invalid";
            }
            var n = b(e, 1, 1, 1, "unsigned");
            switch (n) {
              case 0:
                t.safety_status.safety_status_fall = "Fall Cleared";
                break;
              case 1:
                t.safety_status.safety_status_fall = "Active";
                break;
              default:
                t.safety_status.safety_status_fall = "Invalid";
            }
            var n = b(e, 1, 2, 2, "unsigned");
            switch (n) {
              case 0:
                t.safety_status.safety_status_sh = "Off";
                break;
              case 1:
                t.safety_status.safety_status_sh = "On";
                break;
              default:
                t.safety_status.safety_status_sh = "Invalid";
            }
            var n = b(e, 1, 3, 3, "unsigned");
            switch (n) {
              case 0:
                t.safety_status.safety_status_ear = "Inactive";
                break;
              case 1:
                t.safety_status.safety_status_ear = "Active";
                break;
              default:
                t.safety_status.safety_status_ear = "Invalid";
            }
            var n = b(e, 1, 4, 4, "unsigned");
            switch (n) {
              case 0:
                t.safety_status.safety_status_pressure = "Inactive";
                break;
              case 1:
                t.safety_status.safety_status_pressure = "Active";
                break;
              default:
                t.safety_status.safety_status_pressure = "Invalid";
            }
            return 1;
          },
        },
      ]),
    25 === e.fPort &&
      (n = [
        {
          key: [10],
          fn: function (e) {
            t.hasOwnProperty("ble_1") || (t.ble_1 = {});
            for (var n = [], s = e.length / 7, a = 0; a < s; a++) {
              var r = {};
              (r.id_01 = b(e, 7, 55, 8, "hexstring")),
                (r.rssi_01 = b(e, 7, 7, 0, "signed")),
                n.push(r),
                (e = e.slice(7));
            }
            return (t.ble_1 = n), 7 * s;
          },
        },
        {
          key: [176],
          fn: function (e) {
            t.hasOwnProperty("ble_2") || (t.ble_2 = {});
            for (var n = [], s = e.length / 7, a = 0; a < s; a++) {
              var r = {};
              (r.id_02 = b(e, 7, 55, 8, "hexstring")),
                (r.rssi_02 = b(e, 7, 7, 0, "signed")),
                n.push(r),
                (e = e.slice(7));
            }
            return (t.ble_2 = n), 7 * s;
          },
        },
        {
          key: [177],
          fn: function (e) {
            t.hasOwnProperty("ble_3") || (t.ble_3 = {});
            for (var n = [], s = e.length / 7, a = 0; a < s; a++) {
              var r = {};
              (r.id_03 = b(e, 7, 55, 8, "hexstring")),
                (r.rssi_03 = b(e, 7, 7, 0, "signed")),
                n.push(r),
                (e = e.slice(7));
            }
            return (t.ble_3 = n), 7 * s;
          },
        },
        {
          key: [178],
          fn: function (e) {
            t.hasOwnProperty("ble_4") || (t.ble_4 = {});
            for (var n = [], s = e.length / 7, a = 0; a < s; a++) {
              var r = {};
              (r.id_04 = b(e, 7, 55, 8, "hexstring")),
                (r.rssi_04 = b(e, 7, 7, 0, "signed")),
                n.push(r),
                (e = e.slice(7));
            }
            return (t.ble_4 = n), 7 * s;
          },
        },
        {
          key: [179],
          fn: function (e) {
            t.hasOwnProperty("ble_5") || (t.ble_5 = {});
            for (var n = [], s = e.length / 7, a = 0; a < s; a++) {
              var r = {};
              (r.id_05 = b(e, 7, 55, 8, "hexstring")),
                (r.rssi_05 = b(e, 7, 7, 0, "signed")),
                n.push(r),
                (e = e.slice(7));
            }
            return (t.ble_5 = n), 7 * s;
          },
        },
      ]),
    100 === e.fPort &&
      (n = [
        {
          key: [16],
          fn: function (e) {
            var n = b(e, 2, 15, 15, "unsigned");
            switch (n) {
              case 0:
                t.join_mode = "ABP";
                break;
              case 1:
                t.join_mode = "OTAA";
                break;
              default:
                t.join_mode = "Invalid";
            }
            return 2;
          },
        },
        {
          key: [17],
          fn: function (e) {
            t.hasOwnProperty("loramac_opts") || (t.loramac_opts = {});
            var n = b(e, 2, 3, 3, "unsigned");
            switch (n) {
              case 0:
                t.loramac_opts.loramac_adr = "Disable";
                break;
              case 1:
                t.loramac_opts.loramac_adr = "Enable";
                break;
              default:
                t.loramac_opts.loramac_adr = "Invalid";
            }
            var n = b(e, 2, 2, 2, "unsigned");
            switch (n) {
              case 0:
                t.loramac_opts.loramac_duty_cycle = "Disable";
                break;
              case 1:
                t.loramac_opts.loramac_duty_cycle = "Enable";
                break;
              default:
                t.loramac_opts.loramac_duty_cycle = "Invalid";
            }
            var n = b(e, 2, 1, 1, "unsigned");
            switch (n) {
              case 0:
                t.loramac_opts.loramac_ul_type = "Private";
                break;
              case 1:
                t.loramac_opts.loramac_ul_type = "Public";
                break;
              default:
                t.loramac_opts.loramac_ul_type = "Invalid";
            }
            var n = b(e, 2, 0, 0, "unsigned");
            switch (n) {
              case 0:
                t.loramac_opts.loramac_confirmed = "Unconfirmed";
                break;
              case 1:
                t.loramac_opts.loramac_confirmed = "Confirmed";
                break;
              default:
                t.loramac_opts.loramac_confirmed = "Invalid";
            }
            return 2;
          },
        },
        {
          key: [18],
          fn: function (e) {
            return (
              t.hasOwnProperty("loramac_dr_tx") || (t.loramac_dr_tx = {}),
              (t.loramac_dr_tx.loramac_default_dr = b(e, 2, 11, 8, "unsigned")),
              (t.loramac_dr_tx.loramac_default_tx_pwr = b(
                e,
                2,
                3,
                0,
                "unsigned"
              )),
              2
            );
          },
        },
        {
          key: [19],
          fn: function (e) {
            return (
              t.hasOwnProperty("loramac_rx2") || (t.loramac_rx2 = {}),
              (t.loramac_rx2.loramac_rx2_freq = b(e, 5, 39, 8, "unsigned")),
              (t.loramac_rx2.loramac_rx2_dr = b(e, 5, 7, 0, "unsigned")),
              5
            );
          },
        },
        {
          key: [32],
          fn: function (e) {
            return (t.seconds_per_core_tick = b(e, 4, 31, 0, "unsigned")), 4;
          },
        },
        {
          key: [33],
          fn: function (e) {
            return (t.ticks_battery = b(e, 2, 15, 0, "unsigned")), 2;
          },
        },
        {
          key: [34],
          fn: function (e) {
            return (t.ticks_normal_state = b(e, 2, 15, 0, "unsigned")), 2;
          },
        },
        {
          key: [35],
          fn: function (e) {
            return (t.ticks_emergency_state = b(e, 2, 15, 0, "unsigned")), 2;
          },
        },
        {
          key: [36],
          fn: function (e) {
            return (t.ticks_accelerometer = b(e, 2, 15, 0, "unsigned")), 2;
          },
        },
        {
          key: [37],
          fn: function (e) {
            return (t.ticks_temperature = b(e, 2, 15, 0, "unsigned")), 2;
          },
        },
        {
          key: [38],
          fn: function (e) {
            return (
              (t.ticks_safety_status_normal = b(e, 2, 15, 0, "unsigned")), 2
            );
          },
        },
        {
          key: [39],
          fn: function (e) {
            return (t.ticks_pressure = b(e, 2, 15, 0, "unsigned")), 2;
          },
        },
        {
          key: [40],
          fn: function (e) {
            return (
              t.hasOwnProperty("eb_active_buzz_config") ||
                (t.eb_active_buzz_config = {}),
              (t.eb_active_buzz_config.eb_buzz_active_on_time = (
                0.1 * b(e, 3, 23, 16, "unsigned")
              ).toFixed(1)),
              (t.eb_active_buzz_config.eb_buzz_active_off_time = (
                0.1 * b(e, 3, 15, 8, "unsigned")
              ).toFixed(1)),
              (t.eb_active_buzz_config.eb_buzz_active_num_on_offs = b(
                e,
                3,
                7,
                0,
                "unsigned"
              )),
              3
            );
          },
        },
        {
          key: [41],
          fn: function (e) {
            return (
              t.hasOwnProperty("eb_inactive_buzz_config") ||
                (t.eb_inactive_buzz_config = {}),
              (t.eb_inactive_buzz_config.eb_buzz_inactive_on_time = (
                0.1 * b(e, 3, 23, 16, "unsigned")
              ).toFixed(1)),
              (t.eb_inactive_buzz_config.eb_buzz_inactive_off_time = (
                0.1 * b(e, 3, 15, 8, "unsigned")
              ).toFixed(1)),
              (t.eb_inactive_buzz_config.eb_buzz_inactive_num_on_offs = b(
                e,
                3,
                7,
                0,
                "unsigned"
              )),
              3
            );
          },
        },
        {
          key: [44],
          fn: function (e) {
            return (t.sh_debounce_interval = b(e, 1, 7, 0, "unsigned")), 1;
          },
        },
        {
          key: [45],
          fn: function (e) {
            return (
              t.hasOwnProperty("sh_buzz_config") || (t.sh_buzz_config = {}),
              (t.sh_buzz_config.sh_buzz_when_to = b(e, 5, 33, 32, "hexstring")),
              (t.sh_buzz_config.sh_buzz_on_time = (
                0.1 * b(e, 5, 31, 24, "unsigned")
              ).toFixed(1)),
              (t.sh_buzz_config.sh_buzz_off_time = (
                0.1 * b(e, 5, 23, 16, "unsigned")
              ).toFixed(1)),
              (t.sh_buzz_config.sh_buzz_num_on_offs = b(
                e,
                5,
                15,
                8,
                "unsigned"
              )),
              (t.sh_buzz_config.sh_buzz_period = (
                0.1 * b(e, 5, 7, 0, "unsigned")
              ).toFixed(1)),
              5
            );
          },
        },
        {
          key: [48],
          fn: function (e) {
            var n = b(e, 1, 7, 7, "unsigned");
            switch (n) {
              case 0:
                t.gnss_receiver = "Disabled";
                break;
              case 1:
                t.gnss_receiver = "Enabled";
                break;
              default:
                t.gnss_receiver = "Invalid";
            }
            return 1;
          },
        },
        {
          key: [49],
          fn: function (e) {
            t.hasOwnProperty("gnss_report_options") ||
              (t.gnss_report_options = {});
            var n = b(e, 1, 2, 2, "unsigned");
            switch (n) {
              case 0:
                t.gnss_report_options.gnss_dz_status_report = "Disabled";
                break;
              case 1:
                t.gnss_report_options.gnss_dz_status_report = "Enabled";
                break;
              default:
                t.gnss_report_options.gnss_dz_status_report = "Invalid";
            }
            var n = b(e, 1, 1, 1, "unsigned");
            switch (n) {
              case 0:
                t.gnss_report_options.gnss_ground_speed_report = "Disabled";
                break;
              case 1:
                t.gnss_report_options.gnss_ground_speed_report = "Enabled";
                break;
              default:
                t.gnss_report_options.gnss_ground_speed_report = "Invalid";
            }
            var n = b(e, 1, 0, 0, "unsigned");
            switch (n) {
              case 0:
                t.gnss_report_options.gnss_utc_coordinates_report = "Disabled";
                break;
              case 1:
                t.gnss_report_options.gnss_utc_coordinates_report = "Enabled";
                break;
              default:
                t.gnss_report_options.gnss_utc_coordinates_report = "Invalid";
            }
            return 1;
          },
        },
        {
          key: [50],
          fn: function (e) {
            return (
              t.hasOwnProperty("gnss_dz0") || (t.gnss_dz0 = {}),
              (t.gnss_dz0.gnss_dz0_latitude = (
                1072883606e-14 * b(e, 8, 63, 40, "signed")
              ).toFixed(7)),
              (t.gnss_dz0.gnss_dz0_longitude = (
                2145767212e-14 * b(e, 8, 39, 16, "signed")
              ).toFixed(7)),
              (t.gnss_dz0.gnss_dz0_radius = (
                10 * b(e, 8, 15, 0, "signed")
              ).toFixed(1)),
              8
            );
          },
        },
        {
          key: [51],
          fn: function (e) {
            return (
              t.hasOwnProperty("gnss_dz1") || (t.gnss_dz1 = {}),
              (t.gnss_dz1.gnss_dz1_latitude = (
                1072883606e-14 * b(e, 8, 63, 40, "signed")
              ).toFixed(7)),
              (t.gnss_dz1.gnss_dz1_longitude = (
                2145767212e-14 * b(e, 8, 39, 16, "signed")
              ).toFixed(7)),
              (t.gnss_dz1.gnss_dz1_radius = (
                10 * b(e, 8, 15, 0, "signed")
              ).toFixed(1)),
              8
            );
          },
        },
        {
          key: [52],
          fn: function (e) {
            return (
              t.hasOwnProperty("gnss_dz2") || (t.gnss_dz2 = {}),
              (t.gnss_dz2.gnss_dz2_latitude = (
                1072883606e-14 * b(e, 8, 63, 40, "signed")
              ).toFixed(7)),
              (t.gnss_dz2.gnss_dz2_longitude = (
                2145767212e-14 * b(e, 8, 39, 16, "signed")
              ).toFixed(7)),
              (t.gnss_dz2.gnss_dz2_radius = (
                10 * b(e, 8, 15, 0, "signed")
              ).toFixed(1)),
              8
            );
          },
        },
        {
          key: [53],
          fn: function (e) {
            return (
              t.hasOwnProperty("gnss_dz3") || (t.gnss_dz3 = {}),
              (t.gnss_dz3.gnss_dz3_latitude = (
                1072883606e-14 * b(e, 8, 63, 40, "signed")
              ).toFixed(7)),
              (t.gnss_dz3.gnss_dz3_longitude = (
                2145767212e-14 * b(e, 8, 39, 16, "signed")
              ).toFixed(7)),
              (t.gnss_dz3.gnss_dz3_radius = (
                10 * b(e, 8, 15, 0, "signed")
              ).toFixed(1)),
              8
            );
          },
        },
        {
          key: [54],
          fn: function (e) {
            t.hasOwnProperty("gnss_diagnostics_tx") ||
              (t.gnss_diagnostics_tx = {});
            var n = b(e, 1, 0, 0, "unsigned");
            switch (n) {
              case 0:
                t.gnss_diagnostics_tx.num_of_sats = "Disabled";
                break;
              case 1:
                t.gnss_diagnostics_tx.num_of_sats = "Enabled";
                break;
              default:
                t.gnss_diagnostics_tx.num_of_sats = "Invalid";
            }
            var n = b(e, 1, 1, 1, "unsigned");
            switch (n) {
              case 0:
                t.gnss_diagnostics_tx.avg_sat_snr = "Disabled";
                break;
              case 1:
                t.gnss_diagnostics_tx.avg_sat_snr = "Enabled";
                break;
              default:
                t.gnss_diagnostics_tx.avg_sat_snr = "Invalid";
            }
            var n = b(e, 1, 2, 2, "unsigned");
            switch (n) {
              case 0:
                t.gnss_diagnostics_tx.reported_fix_type = "Disabled";
                break;
              case 1:
                t.gnss_diagnostics_tx.reported_fix_type = "Enabled";
                break;
              default:
                t.gnss_diagnostics_tx.reported_fix_type = "Invalid";
            }
            var n = b(e, 1, 3, 3, "unsigned");
            switch (n) {
              case 0:
                t.gnss_diagnostics_tx.time_to_reported_fix = "Disabled";
                break;
              case 1:
                t.gnss_diagnostics_tx.time_to_reported_fix = "Enabled";
                break;
              default:
                t.gnss_diagnostics_tx.time_to_reported_fix = "Invalid";
            }
            var n = b(e, 1, 4, 4, "unsigned");
            switch (n) {
              case 0:
                t.gnss_diagnostics_tx.fix_log_num = "Disabled";
                break;
              case 1:
                t.gnss_diagnostics_tx.fix_log_num = "Enabled";
                break;
              default:
                t.gnss_diagnostics_tx.fix_log_num = "Invalid";
            }
            var n = b(e, 1, 5, 5, "unsigned");
            switch (n) {
              case 0:
                t.gnss_diagnostics_tx.fix_acc_and_num_fixes_report = "Disabled";
                break;
              case 1:
                t.gnss_diagnostics_tx.fix_acc_and_num_fixes_report = "Enabled";
                break;
              default:
                t.gnss_diagnostics_tx.fix_acc_and_num_fixes_report = "Invalid";
            }
            return 1;
          },
        },
        {
          key: [56],
          fn: function (e) {
            t.hasOwnProperty("emergency_state_trigger") ||
              (t.emergency_state_trigger = {});
            var n = b(e, 1, 1, 1, "unsigned");
            switch (n) {
              case 0:
                t.emergency_state_trigger.emergency_trigger_by_ble_dz =
                  "Disabled";
                break;
              case 1:
                t.emergency_state_trigger.emergency_trigger_by_ble_dz =
                  "Enabled";
                break;
              default:
                t.emergency_state_trigger.emergency_trigger_by_ble_dz =
                  "Invalid";
            }
            var n = b(e, 1, 0, 0, "unsigned");
            switch (n) {
              case 0:
                t.emergency_state_trigger.emergency_trigger_by_gnss_dz =
                  "Disabled";
                break;
              case 1:
                t.emergency_state_trigger.emergency_trigger_by_gnss_dz =
                  "Enabled";
                break;
              default:
                t.emergency_state_trigger.emergency_trigger_by_gnss_dz =
                  "Invalid";
            }
            return 1;
          },
        },
        {
          key: [57],
          fn: function (e) {
            return (
              t.hasOwnProperty("emergency_state_led_config") ||
                (t.emergency_state_led_config = {}),
              (t.emergency_state_led_config.emergency_led_on_time = (
                0.01 * b(e, 4, 31, 24, "unsigned")
              ).toFixed(2)),
              (t.emergency_state_led_config.emergency_led_off_time = (
                0.01 * b(e, 4, 23, 16, "unsigned")
              ).toFixed(2)),
              (t.emergency_state_led_config.emergency_led_num_on_offs = b(
                e,
                4,
                15,
                8,
                "unsigned"
              )),
              (t.emergency_state_led_config.emergency_led_period = (
                0.1 * b(e, 4, 7, 0, "unsigned")
              ).toFixed(1)),
              4
            );
          },
        },
        {
          key: [59],
          fn: function (e) {
            return (t.seconds_pressure_sample = b(e, 1, 5, 0, "unsigned")), 1;
          },
        },
        {
          key: [60],
          fn: function (e) {
            var n = b(e, 2, 15, 0, "unsigned");
            switch (n) {
              case 0:
                t.calibration_reference_pressure = "Disabled";
                break;
              case 1:
                t.calibration_reference_pressure = "Enabled";
                break;
              default:
                t.calibration_reference_pressure = "Invalid";
            }
            return 2;
          },
        },
        {
          key: [61],
          fn: function (e) {
            return (
              (t.pressure_threshold_max = b(e, 4, 31, 16, "unsigned")),
              (t.pressure_threshold_min = b(e, 4, 15, 0, "unsigned")),
              4
            );
          },
        },
        {
          key: [65],
          fn: function (e) {
            t.hasOwnProperty("accelerometer_sensitivity") ||
              (t.accelerometer_sensitivity = {});
            var n = b(e, 1, 5, 4, "unsigned");
            switch (n) {
              case 0:
                t.accelerometer_sensitivity.accelerometer_measurement_range =
                  "+/-2g";
                break;
              case 1:
                t.accelerometer_sensitivity.accelerometer_measurement_range =
                  "+/-4 g";
                break;
              case 2:
                t.accelerometer_sensitivity.accelerometer_measurement_range =
                  "+/-8 g";
                break;
              case 3:
                t.accelerometer_sensitivity.accelerometer_measurement_range =
                  "+/-6 g";
                break;
              default:
                t.accelerometer_sensitivity.accelerometer_measurement_range =
                  "Invalid";
            }
            var n = b(e, 1, 2, 0, "unsigned");
            switch (n) {
              case 1:
                t.accelerometer_sensitivity.accelerometer_sample_rate = "1 Hz";
                break;
              case 2:
                t.accelerometer_sensitivity.accelerometer_sample_rate = "10 Hz";
                break;
              case 3:
                t.accelerometer_sensitivity.accelerometer_sample_rate = "25 Hz";
                break;
              case 4:
                t.accelerometer_sensitivity.accelerometer_sample_rate = "50 Hz";
                break;
              case 5:
                t.accelerometer_sensitivity.accelerometer_sample_rate =
                  "100 Hz";
                break;
              case 6:
                t.accelerometer_sensitivity.accelerometer_sample_rate =
                  "200 Hz";
                break;
              case 7:
                t.accelerometer_sensitivity.accelerometer_sample_rate =
                  "400 Hz";
                break;
              default:
                t.accelerometer_sensitivity.accelerometer_sample_rate =
                  "Invalid";
            }
            return 1;
          },
        },
        {
          key: [66],
          fn: function (e) {
            return (
              (t.sleep_acceleration_threshold = (
                0.001 * b(e, 2, 15, 0, "unsigned")
              ).toFixed(3)),
              2
            );
          },
        },
        {
          key: [67],
          fn: function (e) {
            return (t.timeout_to_sleep = b(e, 1, 7, 0, "unsigned")), 1;
          },
        },
        {
          key: [72],
          fn: function (e) {
            return (
              t.hasOwnProperty("free_fall") || (t.free_fall = {}),
              (t.free_fall.free_fall_acceleration_threshold = (
                0.001 * b(e, 4, 31, 16, "unsigned")
              ).toFixed(3)),
              (t.free_fall.free_fall_acceleration_interval = (
                0.001 * b(e, 4, 15, 0, "unsigned")
              ).toFixed(3)),
              4
            );
          },
        },
        {
          key: [73],
          fn: function (e) {
            return (
              t.hasOwnProperty("impact") || (t.impact = {}),
              (t.impact.impact_threshold = (
                0.001 * b(e, 4, 31, 16, "unsigned")
              ).toFixed(3)),
              (t.impact.impact_blackout_duration = (
                0.001 * b(e, 4, 15, 0, "unsigned")
              ).toFixed(3)),
              4
            );
          },
        },
        {
          key: [74],
          fn: function (e) {
            return (
              t.hasOwnProperty("torpidity") || (t.torpidity = {}),
              (t.torpidity.torpidity_threshold = (
                0.001 * b(e, 3, 23, 8, "unsigned")
              ).toFixed(3)),
              (t.torpidity.torpidity_interval = (
                0.001 * b(e, 3, 7, 0, "unsigned")
              ).toFixed(3)),
              3
            );
          },
        },
        {
          key: [80],
          fn: function (e) {
            t.hasOwnProperty("ble_mode") || (t.ble_mode = {});
            var n = b(e, 1, 7, 7, "unsigned");
            switch (n) {
              case 0:
                t.ble_mode.ble_avg_mode = "Disabled";
                break;
              case 1:
                t.ble_mode.ble_avg_mode = "Enabled";
                break;
              default:
                t.ble_mode.ble_avg_mode = "Invalid";
            }
            var n = b(e, 1, 6, 6, "unsigned");
            switch (n) {
              case 0:
                t.ble_mode.ble_dz_status_report = "Disabled";
                break;
              case 1:
                t.ble_mode.ble_dz_status_report = "Enabled";
                break;
              default:
                t.ble_mode.ble_dz_status_report = "Invalid";
            }
            return (
              (t.ble_mode.ble_num_reported_devices = b(e, 1, 5, 0, "unsigned")),
              1
            );
          },
        },
        {
          key: [81],
          fn: function (e) {
            return (
              (t.ble_scan_duration_periodic = b(e, 1, 7, 0, "unsigned")), 1
            );
          },
        },
        {
          key: [82],
          fn: function (e) {
            return (t.ble_scan_interval = b(e, 2, 15, 0, "unsigned")), 2;
          },
        },
        {
          key: [83],
          fn: function (e) {
            return (t.ble_scan_window = b(e, 2, 15, 0, "unsigned")), 2;
          },
        },
        {
          key: [84],
          fn: function (e) {
            return (
              t.hasOwnProperty("ble_range0") || (t.ble_range0 = {}),
              (t.ble_range0.ble_range0_bd_addr_oui = b(
                e,
                9,
                71,
                48,
                "hexstring"
              )),
              (t.ble_range0.ble_range0_bd_addr_start = b(
                e,
                9,
                47,
                24,
                "hexstring"
              )),
              (t.ble_range0.ble_range0_bd_addr_end = b(
                e,
                9,
                23,
                0,
                "hexstring"
              )),
              9
            );
          },
        },
        {
          key: [85],
          fn: function (e) {
            return (
              t.hasOwnProperty("ble_range1") || (t.ble_range1 = {}),
              (t.ble_range1.ble_range1_bd_addr_oui = b(
                e,
                9,
                71,
                48,
                "hexstring"
              )),
              (t.ble_range1.ble_range1_bd_addr_start = b(
                e,
                9,
                47,
                24,
                "hexstring"
              )),
              (t.ble_range1.ble_range1_bd_addr_end = b(
                e,
                9,
                23,
                0,
                "hexstring"
              )),
              9
            );
          },
        },
        {
          key: [86],
          fn: function (e) {
            return (
              t.hasOwnProperty("ble_range2") || (t.ble_range2 = {}),
              (t.ble_range2.ble_range2_bd_addr_oui = b(
                e,
                9,
                71,
                48,
                "hexstring"
              )),
              (t.ble_range2.ble_range2_bd_addr_start = b(
                e,
                9,
                47,
                24,
                "hexstring"
              )),
              (t.ble_range2.ble_range2_bd_addr_end = b(
                e,
                9,
                23,
                0,
                "hexstring"
              )),
              9
            );
          },
        },
        {
          key: [87],
          fn: function (e) {
            return (
              t.hasOwnProperty("ble_range3") || (t.ble_range3 = {}),
              (t.ble_range3.ble_range3_bd_addr_oui = b(
                e,
                9,
                71,
                48,
                "hexstring"
              )),
              (t.ble_range3.ble_range3_bd_addr_start = b(
                e,
                9,
                47,
                24,
                "hexstring"
              )),
              (t.ble_range3.ble_range3_bd_addr_end = b(
                e,
                9,
                23,
                0,
                "hexstring"
              )),
              9
            );
          },
        },
        {
          key: [88],
          fn: function (e) {
            return (
              t.hasOwnProperty("ble_dz0") || (t.ble_dz0 = {}),
              (t.ble_dz0.ble_dz0_bd_addr = b(e, 7, 55, 8, "hexstring")),
              (t.ble_dz0.ble_dz0_rssi = b(e, 7, 7, 0, "signed")),
              7
            );
          },
        },
        {
          key: [89],
          fn: function (e) {
            return (
              t.hasOwnProperty("ble_dz1") || (t.ble_dz1 = {}),
              (t.ble_dz1.ble_dz1_bd_addr = b(e, 7, 55, 8, "hexstring")),
              (t.ble_dz1.ble_dz1_rssi = b(e, 7, 7, 0, "signed")),
              7
            );
          },
        },
        {
          key: [90],
          fn: function (e) {
            return (
              t.hasOwnProperty("ble_dz2") || (t.ble_dz2 = {}),
              (t.ble_dz2.ble_dz2_bd_addr = b(e, 7, 55, 8, "hexstring")),
              (t.ble_dz2.ble_dz2_rssi = b(e, 7, 7, 0, "signed")),
              7
            );
          },
        },
        {
          key: [91],
          fn: function (e) {
            return (
              t.hasOwnProperty("ble_dz3") || (t.ble_dz3 = {}),
              (t.ble_dz3.ble_dz3_bd_addr = b(e, 7, 55, 8, "hexstring")),
              (t.ble_dz3.ble_dz3_rssi = b(e, 7, 7, 0, "signed")),
              7
            );
          },
        },
        {
          key: [104],
          fn: function (e) {
            t.hasOwnProperty("battery_report_options") ||
              (t.battery_report_options = {});
            var n = b(e, 1, 2, 2, "unsigned");
            switch (n) {
              case 0:
                t.battery_report_options.battery_lifetime_dys_report =
                  "Disabled";
                break;
              case 1:
                t.battery_report_options.battery_lifetime_dys_report =
                  "Enabled";
                break;
              default:
                t.battery_report_options.battery_lifetime_dys_report =
                  "Invalid";
            }
            var n = b(e, 1, 1, 1, "unsigned");
            switch (n) {
              case 0:
                t.battery_report_options.battery_lifetime_pct_report =
                  "Disabled";
                break;
              case 1:
                t.battery_report_options.battery_lifetime_pct_report =
                  "Enabled";
                break;
              default:
                t.battery_report_options.battery_lifetime_pct_report =
                  "Invalid";
            }
            return 1;
          },
        },
        {
          key: [105],
          fn: function (e) {
            t.hasOwnProperty("low_battery_threshold") ||
              (t.low_battery_threshold = {});
            var n = b(e, 2, 15, 14, "unsigned");
            switch (n) {
              case 1:
                t.low_battery_threshold.low_battery_threshold_type =
                  "Percentage";
                break;
              case 2:
                t.low_battery_threshold.low_battery_threshold_type = "Days";
                break;
              default:
                t.low_battery_threshold.low_battery_threshold_type = "Invalid";
            }
            return (
              (t.low_battery_threshold.low_battery_threshold_value = b(
                e,
                2,
                13,
                0,
                "unsigned"
              )),
              2
            );
          },
        },
        {
          key: [106],
          fn: function (e) {
            return (
              t.hasOwnProperty("low_battery_led_config") ||
                (t.low_battery_led_config = {}),
              (t.low_battery_led_config.low_battery_led_on_time = (
                0.01 * b(e, 4, 31, 24, "unsigned")
              ).toFixed(2)),
              (t.low_battery_led_config.low_battery_led_off_time = (
                0.01 * b(e, 4, 23, 16, "unsigned")
              ).toFixed(2)),
              (t.low_battery_led_config.low_battery_led_num_on_offs = b(
                e,
                4,
                15,
                8,
                "unsigned"
              )),
              (t.low_battery_led_config.low_battery_led_period = b(
                e,
                4,
                7,
                0,
                "unsigned"
              )),
              4
            );
          },
        },
        {
          key: [107],
          fn: function (e) {
            return (t.avg_energy_trend_window = b(e, 1, 7, 0, "unsigned")), 1;
          },
        },
        {
          key: [108],
          fn: function (e) {
            return (t.buzzer_disable_timeout = b(e, 1, 7, 0, "unsigned")), 1;
          },
        },
        {
          key: [111],
          fn: function (e) {
            return (t.resp_format = b(e, 1, 7, 0, "unsigned")), 1;
          },
        },
        {
          key: [113],
          fn: function (e) {
            t.hasOwnProperty("metadata") || (t.metadata = {}),
              (t.metadata.app_ver_major = b(e, 7, 55, 48, "unsigned")),
              (t.metadata.app_ver_minor = b(e, 7, 47, 40, "unsigned")),
              (t.metadata.app_ver_revision = b(e, 7, 39, 32, "unsigned")),
              (t.metadata.loramac_ver_major = b(e, 7, 31, 24, "unsigned")),
              (t.metadata.loramac_ver_minor = b(e, 7, 23, 16, "unsigned")),
              (t.metadata.loramac_ver_revision = b(e, 7, 15, 8, "unsigned"));
            var n = b(e, 7, 7, 0, "unsigned");
            switch (n) {
              case 0:
                t.metadata.lorawan_region_id = "EU868";
                break;
              case 1:
                t.metadata.lorawan_region_id = "US916";
                break;
              case 2:
                t.metadata.lorawan_region_id = "AS923";
                break;
              case 3:
                t.metadata.lorawan_region_id = "AU915";
                break;
              case 4:
                t.metadata.lorawan_region_id = "IN865";
                break;
              case 5:
                t.metadata.lorawan_region_id = "CN470";
                break;
              case 6:
                t.metadata.lorawan_region_id = "KR920";
                break;
              case 7:
                t.metadata.lorawan_region_id = "RU864";
                break;
              default:
                t.metadata.lorawan_region_id = "Invalid";
            }
            return 7;
          },
        },
      ]),
    16 === e.fPort &&
      (n = [
        {
          key: [13, 60],
          fn: function (e) {
            return (t.num_satellites = b(e, 1, 7, 0, "unsigned")), 1;
          },
        },
        {
          key: [13, 100],
          fn: function (e) {
            return (t.avg_satellite_snr = 0.1 * b(e, 2, 15, 0, "unsigned")), 2;
          },
        },
        {
          key: [13, 149],
          fn: function (e) {
            var n = b(e, 1, 1, 0, "unsigned");
            switch (n) {
              case 0:
                t.fix_type = "No fix available";
                break;
              case 2:
                t.fix_type = "2D fix";
                break;
              case 3:
                t.fix_type = "3D Fix";
                break;
              default:
                t.fix_type = "Invalid";
            }
            return 1;
          },
        },
        {
          key: [13, 150],
          fn: function (e) {
            return (t.time_to_fix = b(e, 2, 15, 0, "unsigned")), 2;
          },
        },
        {
          key: [13, 151],
          fn: function (e) {
            return (
              t.hasOwnProperty("fix_accuracy") || (t.fix_accuracy = {}),
              (t.fix_accuracy.gnss_vertical_accuracy = b(
                e,
                4,
                31,
                16,
                "unsigned"
              ).toFixed(2)),
              (t.fix_accuracy.gnss_horizontal_accuracy = b(
                e,
                4,
                15,
                0,
                "unsigned"
              ).toFixed(2)),
              4
            );
          },
        },
        {
          key: [13, 152],
          fn: function (e) {
            return (
              (t.ground_speed_accuracy = (
                0.001 * b(e, 4, 31, 0, "unsigned")
              ).toFixed(3)),
              4
            );
          },
        },
        {
          key: [13, 153],
          fn: function (e) {
            return (t.num_of_fixes = b(e, 1, 7, 0, "unsigned")), 1;
          },
        },
        {
          key: [13, 15],
          fn: function (e) {
            return (t.log_num = b(e, 2, 15, 0, "unsigned")), 2;
          },
        },
      ]),
    15 === e.fPort &&
      (n = [
        {
          key: [10],
          fn: function (e) {
            return (
              t.hasOwnProperty("log_request_utc_type_a") ||
                (t.log_request_utc_type_a = {}),
              (t.log_request_utc_type_a.year_0a = b(e, 5, 39, 34, "unsigned")),
              (t.log_request_utc_type_a.month_0a = b(e, 5, 33, 30, "unsigned")),
              (t.log_request_utc_type_a.day_0a = b(e, 5, 29, 25, "unsigned")),
              (t.log_request_utc_type_a.hour_0a = b(e, 5, 24, 20, "unsigned")),
              (t.log_request_utc_type_a.minute_0a = b(
                e,
                5,
                19,
                14,
                "unsigned"
              )),
              (t.log_request_utc_type_a.second_0a = b(e, 5, 13, 8, "unsigned")),
              (t.log_request_utc_type_a.number_0a = b(e, 5, 7, 0, "unsigned")),
              5
            );
          },
        },
        {
          key: [11],
          fn: function (e) {
            return (
              t.hasOwnProperty("log_request_utc_type_b") ||
                (t.log_request_utc_type_b = {}),
              (t.log_request_utc_type_b.number_0b = b(e, 1, 7, 0, "unsigned")),
              1
            );
          },
        },
        {
          key: [1],
          fn: function (e) {
            return (
              t.hasOwnProperty("log_utc") || (t.log_utc = {}),
              (t.log_utc.fragment_number_1 = b(e, 5, 39, 32, "unsigned")),
              (t.log_utc.year_1 = b(e, 5, 31, 26, "unsigned")),
              (t.log_utc.month_1 = b(e, 5, 25, 22, "unsigned")),
              (t.log_utc.day_1 = b(e, 5, 21, 17, "unsigned")),
              (t.log_utc.hour_1 = b(e, 5, 16, 12, "unsigned")),
              (t.log_utc.minute_1 = b(e, 5, 11, 6, "unsigned")),
              (t.log_utc.second_1 = b(e, 5, 5, 0, "unsigned")),
              5
            );
          },
        },
        {
          key: [2],
          fn: function (e) {
            return (
              t.hasOwnProperty("log_coordinates") || (t.log_coordinates = {}),
              (t.log_coordinates.fragment_number_2 = b(
                e,
                9,
                71,
                64,
                "unsigned"
              )),
              (t.log_coordinates.latitude_2 = (
                1072883606e-14 * b(e, 9, 63, 40, "signed")
              ).toFixed(7)),
              (t.log_coordinates.longitude_2 = (
                2145767212e-14 * b(e, 9, 39, 16, "signed")
              ).toFixed(7)),
              (t.log_coordinates.altitude_2 = (
                0.144958496 * b(e, 9, 15, 0, "signed") +
                -500
              ).toFixed(3)),
              9
            );
          },
        },
        {
          key: [3],
          fn: function (e) {
            t.hasOwnProperty("log_all") || (t.log_all = {}), (e = e.slice(1));
            for (var n = [], s = e.length / 12, a = 0; a < s; a++) {
              var r = {};
              (r.year_3 = b(e, 12, 95, 90, "unsigned")),
                (r.month_3 = b(e, 12, 89, 86, "unsigned")),
                (r.day_3 = b(e, 12, 85, 81, "unsigned")),
                (r.hour_3 = b(e, 12, 80, 76, "unsigned")),
                (r.minute_3 = b(e, 12, 75, 70, "unsigned")),
                (r.second_3 = b(e, 12, 69, 64, "unsigned")),
                (r.latitude_3 = (
                  1072883606e-14 * b(e, 12, 63, 40, "signed")
                ).toFixed(7)),
                (r.longitude_3 = (
                  2145767212e-14 * b(e, 12, 39, 16, "signed")
                ).toFixed(7)),
                (r.altitude_3 = (
                  0.144958496 * b(e, 12, 15, 0, "signed") +
                  -500
                ).toFixed(3)),
                n.push(r),
                (e = e.slice(12));
            }
            return (t.log_all = n), 12 * s;
          },
        },
      ]);
  try {
    for (var r = a.length; r > 0; ) {
      for (var i = !1, d = 0; d < n.length; d++) {
        var o = n[d],
          u = o.key,
          c = u.length,
          l = f(a, 0, c);
        if (y(l, u)) {
          var g = (0, o.fn)(f(a, c, a.length)) + c;
          (r -= g), (a = f(a, g, a.length)), (i = !0);
          break;
        }
      }
      if (!i) {
        s.push("Unable to decode header " + x(l).toUpperCase());
        break;
      }
    }
  } catch ($) {
    s = "Fatal decoder error";
  }
  function f(e, t, n) {
    for (var s = [], a = 0; a < n - t; a++) s[a] = e[t + a];
    return s;
  }
  function b(e, t, n, s, a) {
    var r = e.slice(0, t);
    return n >= 8 * r.length || n < s
      ? null
      : (function e(t, n) {
          var s = 0;
          if ("unsigned" === n) {
            for (var a = 0; a < t.length; ++a) s = _(s << 8) | t[a];
            return s;
          }
          if ("signed" === n) {
            for (var a = 0; a < t.length; ++a) s = (s << 8) | t[a];
            return (
              s > Math.pow(2, 8 * t.length - 1) &&
                (s -= Math.pow(2, 8 * t.length)),
              s
            );
          }
          return "bool" === n ? 0 !== t[0] : "hexstring" === n ? x(t) : null;
        })(
          (function e(t, n, s) {
            for (
              var a = [],
                r = n - s + 1,
                i = Math.ceil(r / 8),
                d = 0,
                o = 0,
                u = 0;
              u < i;
              u++
            ) {
              r > 8
                ? ((o = (d = s) + 7), (s += 8), (r -= 8))
                : ((o = (d = s) + r - 1), (r = 0));
              var c = t.length - Math.ceil((d + 1) / 8),
                l = t.length - Math.ceil((o + 1) / 8),
                g = 0;
              if (l == c) {
                var $ = d % 8,
                  f = 255 >> (8 - ((o % 8) - $ + 1));
                (g = (t[l] >> $) & f), a.unshift(g);
              } else {
                var b = d % 8,
                  _ = 255 >> (8 - (7 - b + 1)),
                  y = (t[c] >> b) & _,
                  x = 255 >> (8 - ((o % 8) - 0 + 1));
                (g = y | (((t[l] >> 0) & x) << (7 - b + 1))), a.unshift(g);
              }
            }
            return a;
          })(r, n, s),
          a
        );
  }
  function _(e) {
    return e >>> 0;
  }
  function y(e, t) {
    if (e.length != t.length) return !1;
    for (var n = 0; n != e.length; n++) if (e[n] != t[n]) return !1;
    return !0;
  }
  function x(e) {
    for (var t = [], n = 0; n < e.length; ++n)
      t.push(("0" + (255 & e[n]).toString(16)).slice(-2));
    return t.join(" ");
  }
  var p = [],
    m = new Date().toISOString();
  for (var u in t)
    if ("object" != typeof t[u] || Array.isArray(t[u]))
      p.push({ variable: u, value: t[u], time: m });
    else
      for (var h in t[u])
        p.push({ variable: `${u}_${h}`, value: t[u][h], time: m });
  return (
    s.length > 0 &&
      p.push({ variable: "errors", value: s.join(", "), time: m }),
    p
  );
}
const data = payload.find(
    (e) =>
      "payload_raw" === e.variable ||
      "payload" === e.variable ||
      "data" === e.variable
  ),
  port = payload.find(
    (e) =>
      "port" === e.variable || "fPort" === e.variable || "fport" === e.variable
  );
if (data) {
  let e = { bytes: Buffer.from(data.value, "hex"), fPort: port.value };
  payload = parsePayload(e);
}
