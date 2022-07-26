import path from 'path'
import mime from 'mime'
import fs from 'fs'
import fetch from 'node-fetch'

export const parseInputFiles = (files: string): string[] => {
  return files.split(/\r?\n/).reduce<string[]>(
    (acc, line) =>
      acc
        .concat(line.split(','))
        .filter(pat => pat)
        .map(pat => pat.trim()),
    []
  )
}

const getAsset = (url: string) => {
  return {
    name: path.basename(url),
    mime: mime.getType(url) || 'application/octet-stream',
    size: fs.statSync(url).size,
    data: fs.readFileSync(url)
  }
}
export const uploadReleaseAsset = async (
  path: string,
  url: string,
  token: string
) => {
  const asset = getAsset(path)
  const endpoint = new URL(url)
  endpoint.searchParams.append('name', asset.name)
  const resp = await fetch(endpoint, {
    headers: {
      'content-length': `${asset.size}`,
      'content-type': asset.mime,
      authorization: `token ${token}`
    },
    method: 'POST',
    body: asset.data
  })
  const json = await resp.json()
  if (resp.status !== 201) {
    throw new Error(
      `Failed to upload release asset ${asset.name}. received status code ${
        resp.status
      }\n${json.message}\n${JSON.stringify(json.errors)}`
    )
  }
  return json
}
