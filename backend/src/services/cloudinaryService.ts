import { v2 as cloudinary } from 'cloudinary'
import { env } from '../config/env'

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
})

export async function uploadImage(input: {
  dataUrlOrPath: string
  folder?: string
  publicIdPrefix?: string
}) {
  const folder = input.folder ?? env.cloudinary.folder
  const public_id = input.publicIdPrefix ? `${input.publicIdPrefix}_${Date.now()}` : undefined
  const res = await cloudinary.uploader.upload(input.dataUrlOrPath, {
    folder,
    public_id,
    overwrite: true,
    resource_type: 'image',
  })
  return { url: res.secure_url, publicId: res.public_id }
}

export async function deleteAsset(publicId: string) {
  if (!publicId) return { result: 'skipped' as const }
  const res = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
  return res
}


