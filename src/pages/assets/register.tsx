import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import { categories, departments } from '@/data/mock'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  categoryId: z.string().min(1, 'Category is required'),
  departmentId: z.string().min(1, 'Department is required'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  purchasePrice: z.number().min(0, 'Price must be positive'),
  location: z.string().min(1, 'Location is required'),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function RegisterAssetPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 1000))
    toast.success(`Asset "${data.name}" registered successfully!`, { duration: 4000 })
    navigate('/assets')
  }

  return (
    <div className="space-y-6">
      <PageHeader description="Add a new asset to the inventory">
        <Button variant="outline" onClick={() => navigate('/assets')}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Asset Information</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label>Asset Name</Label>
                  <Input placeholder="e.g. MacBook Pro 16" {...register('name')} />
                  {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Serial Number</Label>
                  <Input placeholder="SN-XXXX-XXXX" {...register('serialNumber')} />
                  {errors.serialNumber && <p className="text-xs text-danger">{errors.serialNumber.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input placeholder="HQ - Floor 3" {...register('location')} />
                  {errors.location && <p className="text-xs text-danger">{errors.location.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select onValueChange={(v) => setValue('categoryId', v)}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && <p className="text-xs text-danger">{errors.categoryId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select onValueChange={(v) => setValue('departmentId', v)}>
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.departmentId && <p className="text-xs text-danger">{errors.departmentId.message}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Purchase Details</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Purchase Date</Label>
                  <Input type="date" {...register('purchaseDate')} />
                  {errors.purchaseDate && <p className="text-xs text-danger">{errors.purchaseDate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Purchase Price ($)</Label>
                  <Input type="number" placeholder="0" {...register('purchasePrice', { valueAsNumber: true })} />
                  {errors.purchasePrice && <p className="text-xs text-danger">{errors.purchasePrice.message}</p>}
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Notes</Label>
                  <Textarea placeholder="Additional notes..." {...register('notes')} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Asset Image</CardTitle></CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                </div>
              </CardContent>
            </Card>
            <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Registering...' : 'Register Asset'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
