import * as core from '@actions/core'
import FG from 'fast-glob'
import {uploadReleaseAsset, parseInputFiles} from './utils'

async function run(): Promise<void> {
  try {
    const uploadUrl = core.getInput('upload_url', {required: true})
    const file = core.getInput('files', {required: true})
    const token = core.getInput('token', {required: true})

    const input_files = parseInputFiles(file)
    if (input_files.length) {
      const entries = await FG(input_files)
      const assets = await Promise.all(
        entries.map(async path => {
          const json = await uploadReleaseAsset(path, uploadUrl, token)
          delete json.uploader
          return json
        })
      ).catch(error => {
        throw error
      })
      core.setOutput('assets', assets)
    } else {
      core.setFailed('File cannot be empty')
    }
    console.log(`🎉 Release ready`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
