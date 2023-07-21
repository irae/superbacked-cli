# Superbacked command line utility

## Restore secrets from Superbacked blocks.

## Usage

```console
$ superbacked-cli-darwin-arm64-1.0.0 --help
Usage: superbacked-cli [options] [command]

Options:
  --version          output version
  -h, --help         display help

Commands:
  restore [options]  restore Superbacked block(s)
  help [command]     display help for command

$ superbacked-cli-darwin-arm64-1.0.0 restore --blocks blocks/6f0c75ed.jpg blocks/7eab367d.jpg
Do not use Superbacked on computer that isn’t air-gapped and exclusively used for secret management unless secret is already present on computer.

Superbacked, Inc. and its partners cannot be held responsible for lost or stolen secrets and associated data or value. USE AT YOUR OWN RISK

✔ I agree to above terms and accept underlying risks … yes
✔ Please enter passphrase and press enter … *****************
BIP 39 mnemonic 👉 aisle long foot boost wire fever correct attack sphere beyond hill enrich observe trend prison charge mass wash much roof glass release barely escape

KeePassXC passphrase 👉 situated hazing discard wildlife limpness putdown turbojet

Proton TOTP 👉 otpauth://totp/8a1f14@protonmail.com?secret=IXCLCM7KKJYWWFWINX2OTTWQTYBSJFPU&issuer=Proton&algorithm=SHA1&digits=6&period=30
```
