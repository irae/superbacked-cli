import which from "./which.js"
import spawn from "./spawn.js"

export const combineShares = async (shares: Buffer[]): Promise<string> => {
  const hexShares: string[] = []
  for (const share of shares) {
    hexShares.push(share.toString("hex"))
  }
  const { stdout } = await spawn(which("secret-share-combine"), [], {
    input: hexShares.join("\n"),
  })
  return stdout
}
