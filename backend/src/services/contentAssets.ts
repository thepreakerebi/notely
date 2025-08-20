import { uploadAsset } from './cloudinaryService'

export type AssetResourceType = 'image' | 'video' | 'raw'

export interface ContentAsset {
  publicId: string
  resourceType: AssetResourceType
}

function deepClone<T>(value: T): T {
  try {
    return JSON.parse(JSON.stringify(value)) as T
  } catch {
    return value
  }
}

function detectResourceTypeFromDataUrl(url: string): AssetResourceType {
  // data:mime/type;base64,
  const match = url.match(/^data:([^;]+);/)
  const mime = match?.[1] ?? ''
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/') || mime.startsWith('audio/')) return 'video'
  return 'raw'
}

function getPublicIdPrefix(rt: AssetResourceType): string {
  if (rt === 'image') return 'image'
  if (rt === 'video') return 'video'
  return 'file'
}

export async function uploadDataUrlsAndAnnotate(content: unknown): Promise<{ content: unknown; assets: ContentAsset[] }> {
  if (content == null) return { content, assets: [] }
  const clone = deepClone(content)
  const assets: ContentAsset[] = []

  async function walk(obj: any): Promise<void> {
    if (Array.isArray(obj)) {
      for (const item of obj) await walk(item)
      return
    }
    if (obj && typeof obj === 'object') {
      // Process common link fields
      for (const key of ['url', 'src']) {
        const value = obj[key]
        if (typeof value === 'string') {
          if (value.startsWith('data:')) {
            const rt = detectResourceTypeFromDataUrl(value)
            const uploaded = await uploadAsset({ dataUrlOrPath: value, resourceType: rt, publicIdPrefix: getPublicIdPrefix(rt) })
            obj[key] = uploaded.url
            obj.assetPublicId = uploaded.publicId
            obj.assetResourceType = rt
            assets.push({ publicId: uploaded.publicId, resourceType: rt })
          } else {
            // If already annotated, collect it too
            if (typeof obj.assetPublicId === 'string' && (obj.assetResourceType === 'image' || obj.assetResourceType === 'video' || obj.assetResourceType === 'raw')) {
              assets.push({ publicId: obj.assetPublicId, resourceType: obj.assetResourceType })
            }
          }
        }
      }
      for (const k of Object.keys(obj)) {
        await walk(obj[k])
      }
    }
  }

  await walk(clone)
  return { content: clone, assets }
}

export function extractAssets(content: unknown): ContentAsset[] {
  if (content == null) return []
  const assets: ContentAsset[] = []
  function walk(obj: any): void {
    if (Array.isArray(obj)) {
      for (const item of obj) walk(item)
      return
    }
    if (obj && typeof obj === 'object') {
      if (typeof obj.assetPublicId === 'string' && (obj.assetResourceType === 'image' || obj.assetResourceType === 'video' || obj.assetResourceType === 'raw')) {
        assets.push({ publicId: obj.assetPublicId, resourceType: obj.assetResourceType })
      }
      for (const k of Object.keys(obj)) {
        walk(obj[k])
      }
    }
  }
  walk(content)
  return assets
}


