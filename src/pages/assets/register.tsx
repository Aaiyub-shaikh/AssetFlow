import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Tag, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageShell } from '@/components/layout/page-shell'
import { categories, departments } from '@/data/mock'
import { useAssetStore } from '@/stores/assetStore'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Asset name is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  categoryId: z.string().min(1, 'Category is required'),
  departmentId: z.string().min(1, 'Department is required'),
  purchaseDate: z.string().min(1, 'Acquisition date is required'),
  purchasePrice: z.number({ invalid_type_error: 'Enter a valid cost' }).min(0),
  warrantyExpiry: z.string().min(1, 'Warranty expiry is required'),
  location: z.string().min(1, 'Location is required'),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']),
  notes: z.string().optional(),
  isBookable: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

export function RegisterAssetPage() {
  const navigate = useNavigate()
  const { registerAsset, assets } = useAssetStore()

  const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { condition: 'excellent', isBookable: false },
  })

  const watchedCategory = watch('categoryId')
  const selectedCat = categories.find((c) => c.id === watchedCategory)
  // Preview the next tag
  const previewTag = (() => {
    if (!selectedCat) return 'AF-XXX-001'
    const prefix = `AF-${selectedCat.code}`
    const nums = assets
      .filter((a) => a.tag.startsWith(prefix))
      .map((a) => parseInt(a.tag.replace(prefix + '-', ''), 10))
      .filter((n) => !isNaN(n))
    const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
    return `${prefix}-${String(next).padStart(3, '0')}`
  })()

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 500))
    const asset = registerAsset({
      ...data,
      isBookable: data.isBookable ?? false,
    })
    toast.success(`Asset "${asset.name}" registered as ${asset.tag}!`, { duration: 4000 })
    navigate('/assets')
  }

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/assets')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Register New Asset</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Add an asset to the central inventory with auto-generated tag</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: main info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-white/[0.07] bg-white/[0.03]">
                <CardHeader><CardTitle className="text-base">Asset Information</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <Label>Asset Name *</Label>
                    <Input placeholder="e.g. MacBook Pro 16&quot; M3" {...register('name')} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Serial Number *</Label>
                    <Input placeholder="SN-XXXX-XXXX" {...register('serialNumber')} />
                    {errors.serialNumber && <p className="text-xs text-destructive">{errors.serialNumber.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Location *</Label>
                    <Input placeholder="HQ - Floor 3" {...register('location')} />
                    {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Category *</Label>
                    <Controller name="categoryId" control={control} render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )} />
                    {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Department *</Label>
                    <Controller name="departmentId" control={control} render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                        <SelectContent>
                          {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )} />
                    {errors.departmentId && <p className="text-xs text-destructive">{errors.departmentId.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Condition *</Label>
                    <Controller name="condition" control={control} render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    )} />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <Label>Notes</Label>
                    <Textarea placeholder="Additional details, observations..." {...register('notes')} className="resize-none h-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/[0.07] bg-white/[0.03]">
                <CardHeader><CardTitle className="text-base">Acquisition Details</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Acquisition Date *</Label>
                    <Input type="date" {...register('purchaseDate')} />
                    {errors.purchaseDate && <p className="text-xs text-destructive">{errors.purchaseDate.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Acquisition Cost ($) *</Label>
                    <Input type="number" min="0" placeholder="0" {...register('purchasePrice', { valueAsNumber: true })} />
                    <p className="text-[10px] text-muted-foreground/60">Used for reports only — not linked to accounting</p>
                    {errors.purchasePrice && <p className="text-xs text-destructive">{errors.purchasePrice.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Warranty Expiry *</Label>
                    <Input type="date" {...register('warrantyExpiry')} />
                    {errors.warrantyExpiry && <p className="text-xs text-destructive">{errors.warrantyExpiry.message}</p>}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: preview + options */}
            <div className="space-y-5">
              {/* Auto Tag Preview */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">Auto-Generated Tag</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.08] border border-white/[0.1] px-4 py-3 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary shrink-0" />
                    <code className="text-lg font-bold font-mono tracking-wider text-primary">{previewTag}</code>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 mt-2">Tag is auto-assigned based on category + sequence</p>
                </CardContent>
              </Card>

              {/* Photo/Document upload */}
              <Card className="border-white/[0.07] bg-white/[0.03]">
                <CardHeader><CardTitle className="text-base">Photo / Documents</CardTitle></CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-white/[0.1] rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer">
                    <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG, PDF up to 10MB</p>
                  </div>
                </CardContent>
              </Card>

              {/* Bookable flag */}
              <Card className="border-white/[0.07] bg-white/[0.03]">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Shared / Bookable</p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">Allow employees to book this resource</p>
                    </div>
                    <Controller name="isBookable" control={control} render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )} />
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full h-11 gap-2" disabled={isSubmitting}>
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Registering…' : 'Register Asset'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </PageShell>
  )
}
