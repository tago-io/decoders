## Summary

<!-- One to three sentences: decoder path, what changed, and why. For new decoders, name network vs connector and manufacturer/device. -->

## Test plan

- [ ] `pnpm run check` (or `pnpm run linter` + `pnpm test`)
- [ ] `pnpm test`
- [ ] `pnpm start validator`
- [ ] Unit tests added or updated for the decoder
- [ ] Non-decoding payload test ("shall not pass") where the decoder must ignore out-of-scope payloads
- [ ] `pnpm start generate` (maintainers only, when cutting a release)

### New or updated decoder

- [ ] Folder under `decoders/network/` or `decoders/connector/` follows [README](./README.md) layout
- [ ] `network.jsonc` or `connector.jsonc` validates against `schema/`
- [ ] Version folders use SemVer; per-version `manifest.jsonc` present
- [ ] Decoder source is TypeScript with unit tests
- [ ] `description`, `install_text`, and `device_annotation` are objective (no subjective marketing, no off-platform links)

### Review context

- **Type:** <!-- new network / new connector / fix existing -->
- **Decoder path:** <!-- e.g. decoders/connector/manufacturer/device -->
- **Hardware or protocol documentation:**
- **Example test payload:**

Closes #
