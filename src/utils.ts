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
export const uploadUrl = (url: string): string => {
  const templateMarkerPos = url.indexOf('{')
  if (templateMarkerPos > -1) {
    return url.substring(0, templateMarkerPos)
  }
  return url
}
const getAsset = (pathUrl: string) => {
  return {
    name: path.basename(pathUrl),
    mime: mime.getType(pathUrl) || 'application/octet-stream',
    size: fs.statSync(pathUrl).size,
    data: fs.readFileSync(pathUrl)
  }
}
export const uploadReleaseAsset = async (
  path: string,
  url: string,
  token: string,
  newHeader: Record<string, undefined>,
  method: string
) => {
  const asset = getAsset(path)
  const endpoint = new URL(uploadUrl(url))
  endpoint.searchParams.append('name', asset.name)
  const resp = await fetch(endpoint, {
    headers: {
      'content-length': `${asset.size}`,
      'content-type': asset.mime,
      authorization: `token ${token}`,
      ...(newHeader || {})
    },
    method: method || 'POST',
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
