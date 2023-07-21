import { join } from "path"
import { copyFileSync } from "fs"
import { tmpdir } from "os"
import { execSync } from "child_process"

export default (binary: string) => {
  const binaryPath = join(
    __dirname,
    "../../",
    "deps",
    process.platform,
    process.arch,
    binary
  )

  if (process.pkg) {
    const tmpBinaryPath = join(tmpdir(), binary)
    copyFileSync(binaryPath, tmpBinaryPath)
    execSync(`chmod +x ${tmpBinaryPath}`)
    return tmpBinaryPath
  }

  return binaryPath
}
