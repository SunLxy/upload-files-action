import * as core from '@actions/core'
import FG from 'fast-glob'
import {uploadReleaseAsset, parseInputFiles} from './utils'
import path from 'path'

async function run(): Promise<void> {
  try {
    const uploadUrl = core.getInput('upload_url')
    const file = core.getInput('files')
    const token = core.getInput('token')
    const headers = core.getInput('headers')
    const method = core.getInput('method')
    const cwd = core.getInput('cwd')

    if (!uploadUrl) {
      throw new Error('uploadUrl is empty')
    }
    if (!file) {
      throw new Error('file is empty')
    }
    if (!token) {
      throw new Error('token is empty')
    }

    let newHeader = {}
    // 处理 headers 值
    if (headers && headers.trim()) {
      newHeader = JSON.parse(headers)
    }

    const input_files = parseInputFiles(file)
    if (input_files.length) {
      const newCwd = cwd || process.cwd()
      const entries = await FG(input_files, {cwd: newCwd})
      console.log(`entries---->${JSON.stringify(entries, null, 2)}`)
      core.info(`entries---->${JSON.stringify(entries, null, 2)}`)
      const assets = await Promise.all(
        entries.map(async pathUrls => {
          const json = await uploadReleaseAsset(
            path.join(newCwd, pathUrls),
            uploadUrl,
            token,
            newHeader,
            method
          )
          delete json.uploader
          return json
        })
      ).catch(error => {
        throw error
      })
      core.setOutput('assets', assets)
      console.log(`'assets--->${JSON.stringify(assets, null, 2)}`)
      core.info(`assets: ${JSON.stringify(assets, null, 2)}`)
    } else {
      core.setFailed('File cannot be empty')
    }
    console.log(`🎉 Release ready`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
