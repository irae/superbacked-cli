import which from "./which.js"
import spawn from "./spawn.js"

export default async (passphrase: string, salt: string): Promise<Buffer> => {
  const { stdout } = await spawn(
    which("argon2"),
    [salt, "-d", "-p", "2", "-k", "65536", "-r", "-t", "10"],
    { input: passphrase }
  )
  return Buffer.from(stdout, "hex")
}
