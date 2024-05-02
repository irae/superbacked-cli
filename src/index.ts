import { program as cli } from "commander"
import prompts from "prompts"
import chalk from "chalk"
import sharp from "sharp"
import jsQr from "jsqr"
import { decrypt } from "blockcrypt"
import argon2 from "./utilities/argon2.js"
import { combineShares } from "./utilities/shamir.js"

cli.name("superbacked-cli")
cli.version("1.0.2", "--version", "output version")

cli.helpOption("-h, --help", "display help")

const shamirShares: Buffer[] = []

const shamirBuffer = Buffer.from("shamir:")
const shamirBufferLength = shamirBuffer.length

interface RestoreOptions {
  blocks: string[]
  debug: boolean
}

interface Payload {
  salt: string
  iv: string
  headers: string
  data: string
  metadata: {
    label: string
  }
}

cli
  .command("restore")
  .description("restore Superbacked block(s)")
  .requiredOption("-b, --blocks <paths...>", "path(s) to JPEG block(s)")
  .option("-d, --debug", "enable debugging")
  .action(async (options: RestoreOptions) => {
    try {
      console.log(
        chalk.grey(
          `${chalk.bold.red(
            "Do not"
          )} use Superbacked on computer that isn’t ${chalk.bold(
            "air-gapped"
          )} and ${chalk.bold(
            "exclusively used"
          )} for secret management unless secret is already present on computer.\n`
        )
      )
      console.log(
        chalk.grey(
          `Superbacked, Inc. and its employees, operators, partners and shareholders cannot be held liable for lost or stolen secrets or associated data or value. ${chalk.bold.red(
            "USE AT YOUR OWN RISK"
          )}\n`
        )
      )
      const { confirmation } = await prompts(
        [
          {
            message: "I agree to above terms and accept underlying risks",
            name: "confirmation",
            type: "confirm",
          },
        ],
        {
          onCancel: () => {
            console.log(chalk.grey("Cancelled"))
            process.exit(0)
          },
        }
      )
      if (confirmation !== true) {
        console.log(chalk.grey("Cancelled"))
        process.exit(0)
      }
      const payloads: Payload[] = []
      for (const path of options.blocks) {
        const { data, info } = await sharp(path)
          .ensureAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true })
        const code = jsQr(
          new Uint8ClampedArray(data.buffer),
          info.width,
          info.height,
          {
            inversionAttempts: "dontInvert",
          }
        )
        if (code) {
          const payload = JSON.parse(code.data)
          if (
            !payload.salt ||
            !payload.iv ||
            !payload.headers ||
            !payload.data ||
            !payload.metadata
          ) {
            throw new Error("Invalid block")
          } else {
            payloads.push(payload)
          }
        }
      }
      const { passphrase } = await prompts(
        [
          {
            message: "Please enter passphrase and press enter",
            name: "passphrase",
            type: "password",
            validate: (value: string) => {
              if (value === "") {
                return "Invalid passphrase"
              }
              return true
            },
          },
        ],
        {
          onCancel: () => {
            console.log(chalk.grey("Cancelled"))
            process.exit(0)
          },
        }
      )
      if (payloads.length === 1) {
        const payload = payloads[0]
        const message = await decrypt(
          passphrase,
          Buffer.from(payload.salt, "base64"),
          Buffer.from(payload.iv, "base64"),
          Buffer.from(payload.headers, "base64"),
          Buffer.from(payload.data, "base64"),
          argon2
        )
        if (
          Buffer.compare(
            message.subarray(0, shamirBufferLength),
            shamirBuffer
          ) === 0
        ) {
          throw new Error(
            "More than one block required to restore distributed backup"
          )
        } else {
          console.log(message.toString())
        }
      } else {
        for (const payload of payloads) {
          const message = await decrypt(
            passphrase,
            Buffer.from(payload.salt, "base64"),
            Buffer.from(payload.iv, "base64"),
            Buffer.from(payload.headers, "base64"),
            Buffer.from(payload.data, "base64"),
            argon2
          )
          if (
            Buffer.compare(
              message.subarray(0, shamirBufferLength),
              shamirBuffer
            ) === 0
          ) {
            shamirShares.push(message.subarray(shamirBufferLength))
          }
        }
        const secret = await combineShares(shamirShares)
        console.log(secret.toString())
      }
    } catch (error) {
      if (error.message.match(/input file is missing/i)) {
        if (options.debug === true) {
          console.error(error)
        }
        console.error(chalk.red("Could not load block(s)"))
      } else if (
        error.message.match(/header not found/i) ||
        error.message.match(
          /more than one block required to restore distributed backup/i
        ) ||
        error.message.match(/shares did not combine to a valid secret/i)
      ) {
        if (options.debug === true) {
          console.error(error)
        }
        console.error(chalk.red("Could not restore block(s)"))
      } else {
        console.error(error)
      }
      process.exit(1)
    }
  })

cli.parse()
