import { motion } from 'framer-motion'
import { Building2, Users, MapPin, Globe, Calendar, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import { organization, departments } from '@/data/mock'

export function OrganizationPage() {
  const stats = [
    { label: 'Total Employees', value: organization.employees.toLocaleString(), icon: Users },
    { label: 'Locations', value: organization.locations.toString(), icon: MapPin },
    { label: 'Departments', value: departments.length.toString(), icon: Building2 },
    { label: 'Founded', value: organization.founded, icon: Calendar },
  ]

  return (
    <div className="space-y-8">
      <PageHeader description="Company profile and organizational overview" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card gradient-hero p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/30">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold">{organization.name}</h2>
            <p className="text-muted-foreground mt-1">{organization.industry}</p>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{organization.address}</span>
              <a href={organization.website} className="flex items-center gap-1.5 text-primary hover:underline">
                <Globe className="h-4 w-4" />{organization.website}<ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Department Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept, i) => (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-white/5 transition-colors"
              >
                <div>
                  <p className="font-medium">{dept.name}</p>
                  <p className="text-xs text-muted-foreground">{dept.head} · {dept.employees} employees</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">{dept.assets}</p>
                  <p className="text-xs text-muted-foreground">assets</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
