import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { Camera } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAssetStore } from '@/stores/assetStore'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'react-hot-toast'

interface QRScannerDialogProps {
  open: boolean
  onClose: () => void
}

export function QRScannerDialog({ open, onClose }: QRScannerDialogProps) {
  const [cameraActive, setCameraActive] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const navigate = useNavigate()
  const { assets } = useAssetStore()
  const [selectedAssetId, setSelectedAssetId] = useState('')

  useEffect(() => {
    if (open && cameraActive) {
      // Small timeout to ensure container #qr-reader-el is in DOM
      const timer = setTimeout(() => {
        const html5Qrcode = new Html5Qrcode('qr-reader-el')
        scannerRef.current = html5Qrcode

        html5Qrcode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 200, height: 200 } },
          (decodedText) => {
            try {
              // Parse tag or exact ID from url
              const match = decodedText.match(/\/assets\/details\/(ast-\d+)/)
              const parsedId = match ? match[1] : decodedText
              
              const matchedAsset = assets.find(a => a.id === parsedId || a.tag === parsedId)
              if (matchedAsset) {
                toast.success('QR Code Scanned!')
                html5Qrcode.stop().then(() => {
                  onClose()
                  navigate(`/assets/details/${matchedAsset.id}`)
                })
              } else {
                toast.error('Scanned tag does not match any organizational asset')
              }
            } catch (err) {
              console.error('Scan handling failed:', err)
            }
          },
          () => {} // silent frame scanning failures
        ).catch((err) => {
          console.error('Failed to start camera:', err)
          toast.error('Could not activate camera. Please check permissions.')
          setCameraActive(false)
        })
      }, 100)

      return () => {
        clearTimeout(timer)
        if (scannerRef.current && scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(console.error)
        }
      }
    }
  }, [open, cameraActive, assets])

  // Stop camera if dialog is closed
  useEffect(() => {
    if (!open) {
      setCameraActive(false)
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [open])

  const handleSimulate = () => {
    if (!selectedAssetId) return
    onClose()
    navigate(`/assets/details/${selectedAssetId}`)
    toast.success('QR Scan Simulated!')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Asset QR Code</DialogTitle>
          <DialogDescription>
            Hold a printed asset QR tag up to your device camera to open its dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {cameraActive ? (
            <div className="relative w-full aspect-square max-w-[280px] bg-black rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
              <div id="qr-reader-el" className="w-full h-full" />
              {/* Corner scan overlays */}
              <div className="absolute inset-8 border-2 border-primary/40 pointer-events-none rounded-xl">
                <div className="absolute inset-0 bg-primary/5 animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="w-full aspect-square max-w-[280px] bg-white/[0.02] border border-white/[0.08] border-dashed rounded-2xl flex flex-col items-center justify-center gap-3">
              <div className="p-4 bg-primary/10 rounded-full text-primary">
                <Camera className="h-8 w-8" />
              </div>
              <Button size="sm" onClick={() => setCameraActive(true)}>
                Activate Camera
              </Button>
            </div>
          )}

          {/* Simulation Fallback */}
          <div className="w-full border-t border-white/[0.05] pt-4 mt-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Scan Simulation Tool</p>
            <div className="flex gap-2">
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-foreground"
              >
                <option value="" disabled className="bg-background">Select asset to simulate scan</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id} className="bg-background">
                    {a.name} — {a.tag}
                  </option>
                ))}
              </select>
              <Button size="sm" onClick={handleSimulate} disabled={!selectedAssetId} className="h-8">
                Scan
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
