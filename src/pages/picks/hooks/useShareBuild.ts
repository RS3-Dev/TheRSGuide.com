import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { regionMapData } from '@/data/leagues/region-map-data'
import { createShare } from '@/lib/shares-api'
import {
  drawBuildCard,
  loadPickImages,
  type PickImageMap,
} from '../utils/share-card'
import { createDiscordShareText, createTwitterShareUrl } from '../utils/share-actions'
import {
  canvasToShareImage,
  copyText,
  getShareImageFilename,
} from '../utils/share-browser'
import {
  blessingSelectionsToArray,
  type BlessingSelections,
  type RegionSelection,
} from '@/lib/picks-state'
import { REQUIRED_RELIC_COUNT } from '../../../../shared/share-contract'

export type ShareStatus = 'preparing' | 'creating' | 'ready' | 'error'

type UseShareBuildOptions = {
  buildName: string
  selectedBlessings: BlessingSelections
  selectedRejuvenatedRelic: string
  selectedRegions: RegionSelection[]
  selectedRelics: Record<number, string>
}

const DISCORD_APP_URL = 'https://discord.com/app'
const SHARE_OPEN_DELAY_MS = 1_000

export function useShareBuild({
  buildName,
  selectedBlessings,
  selectedRejuvenatedRelic,
  selectedRegions,
  selectedRelics,
}: UseShareBuildOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const requestIdRef = useRef(crypto.randomUUID())
  const sharePromiseRef = useRef<Promise<string> | null>(null)
  const shareOpenTimeoutsRef = useRef<number[]>([])
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [shareStatus, setShareStatus] = useState<ShareStatus>('preparing')
  const [shareError, setShareError] = useState<string | null>(null)
  const [shareAttempt, setShareAttempt] = useState(0)
  const [pickImages, setPickImages] = useState<PickImageMap>({})

  useEffect(() => {
    let isActive = true

    void loadPickImages(
      selectedRelics,
      selectedBlessings,
      selectedRejuvenatedRelic,
    ).then((images) => {
      if (isActive) setPickImages(images)
    })

    return () => {
      isActive = false
    }
  }, [selectedBlessings, selectedRejuvenatedRelic, selectedRelics])

  useEffect(() => {
    if (canvasRef.current) {
      drawBuildCard(
        canvasRef.current,
        buildName,
        regionMapData,
        selectedRelics,
        selectedRegions,
        selectedBlessings,
        pickImages,
        selectedRejuvenatedRelic,
      )
    }
  }, [
    buildName,
    pickImages,
    selectedBlessings,
    selectedRegions,
    selectedRejuvenatedRelic,
    selectedRelics,
  ])

  useEffect(() => {
    const scheduledTimeouts = shareOpenTimeoutsRef.current
    return () => {
      for (const timeout of scheduledTimeouts) window.clearTimeout(timeout)
    }
  }, [])

  const scheduleShareDestination = useCallback((url: string, destination: string) => {
    const timeout = window.setTimeout(() => {
      const destinationWindow = window.open(url, '_blank')
      if (destinationWindow) {
        destinationWindow.opener = null
        return
      }
      toast.error(`${destination} could not open`, {
        description: 'Allow pop-ups for The RS Guide and try again.',
      })
    }, SHARE_OPEN_DELAY_MS)
    shareOpenTimeoutsRef.current.push(timeout)
  }, [])

  const createShareImage = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) throw new Error('The share preview is still loading')
    const loadedPickImages = await loadPickImages(
      selectedRelics,
      selectedBlessings,
      selectedRejuvenatedRelic,
    )
    await document.fonts.ready
    drawBuildCard(
      canvas,
      buildName,
      regionMapData,
      selectedRelics,
      selectedRegions,
      selectedBlessings,
      loadedPickImages,
      selectedRejuvenatedRelic,
    )
    return canvasToShareImage(canvas)
  }, [buildName, selectedBlessings, selectedRegions, selectedRejuvenatedRelic, selectedRelics])

  const createShareLink = useCallback(async () => {
    const share = await createShare(
      {
        requestId: requestIdRef.current,
        buildName,
        blessings: blessingSelectionsToArray(selectedBlessings),
        regions: selectedRegions.map((region) => region.id),
        relics: Array.from(
          { length: REQUIRED_RELIC_COUNT },
          (_, index) => selectedRelics[index + 1] ?? '',
        ),
        rejuvenatedRelic: selectedRejuvenatedRelic,
      },
      await createShareImage(),
    )
    if (!selectedRejuvenatedRelic) {
      return share.shareUrl
    }

    const shareUrl = new URL(share.shareUrl)
    if (selectedRejuvenatedRelic) {
      shareUrl.searchParams.set('rejuvenatedRelic', selectedRejuvenatedRelic)
    }
    return shareUrl.toString()
  }, [buildName, createShareImage, selectedBlessings, selectedRegions, selectedRejuvenatedRelic, selectedRelics])

  useEffect(() => {
    if (shareUrl) return

    let isActive = true
    setShareError(null)
    setShareStatus('creating')
    const sharePromise = sharePromiseRef.current ?? createShareLink()
    sharePromiseRef.current = sharePromise
    void sharePromise
      .then((createdShareUrl) => {
        if (!isActive) return
        setShareUrl(createdShareUrl)
        setShareStatus('ready')
      })
      .catch((error: unknown) => {
        sharePromiseRef.current = null
        if (!isActive) return
        setShareStatus('error')
        setShareError(error instanceof Error ? error.message : 'Unable to create share link')
      })

    return () => {
      isActive = false
    }
  }, [createShareLink, shareAttempt, shareUrl])

  const downloadImage = useCallback(async () => {
    try {
      const blob = await createShareImage()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = getShareImageFilename(buildName, blob.type)
      link.href = url
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
    } catch (error) {
      setShareError(error instanceof Error ? error.message : 'Unable to create share image')
    }
  }, [buildName, createShareImage])

  const copyLink = useCallback(async () => {
    if (!shareUrl) return
    setShareError(null)
    try {
      await copyText(shareUrl)
      toast.success('Share link copied')
    } catch (error) {
      setShareError(error instanceof Error ? error.message : 'Unable to copy share link')
    }
  }, [shareUrl])

  const shareToDiscord = useCallback(async () => {
    if (!shareUrl) return
    setShareError(null)
    try {
      await copyText(createDiscordShareText(shareUrl))
      toast.success('Copied for Discord', {
        description: 'Opening Discord',
        duration: 1_800,
      })
      scheduleShareDestination(DISCORD_APP_URL, 'Discord')
    } catch (error) {
      setShareError(error instanceof Error ? error.message : 'Unable to copy Discord share text')
    }
  }, [scheduleShareDestination, shareUrl])

  const shareToTwitter = useCallback(() => {
    if (!shareUrl) return
    toast.success('Ready to share on Twitter', {
      description: 'Opening Twitter',
      duration: 1_800,
    })
    scheduleShareDestination(createTwitterShareUrl(shareUrl), 'Twitter')
  }, [scheduleShareDestination, shareUrl])

  const retryShare = useCallback(() => {
    sharePromiseRef.current = null
    setShareError(null)
    setShareAttempt((attempt) => attempt + 1)
  }, [])

  return {
    canvasRef,
    copyLink,
    downloadImage,
    isMapReady: true,
    retryShare,
    shareError,
    shareStatus,
    shareToDiscord,
    shareToTwitter,
    shareUrl,
  }
}
