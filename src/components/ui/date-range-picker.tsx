'use client'

import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import { format, subMonths, startOfMonth, endOfMonth, startOfYear } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface DateRange {
  from: Date
  to: Date
}

interface DateRangePickerProps {
  value: DateRange | null
  onChange: (range: DateRange | null) => void
  className?: string
}

type PresetKey = 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'custom'

const presets: { key: PresetKey; label: string; getRange: () => DateRange }[] = [
  {
    key: 'this_month',
    label: 'Ce mois',
    getRange: () => ({
      from: startOfMonth(new Date()),
      to: new Date(),
    }),
  },
  {
    key: 'last_month',
    label: 'Mois dernier',
    getRange: () => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    }),
  },
  {
    key: 'last_3_months',
    label: '3 derniers mois',
    getRange: () => ({
      from: startOfMonth(subMonths(new Date(), 2)),
      to: new Date(),
    }),
  },
  {
    key: 'last_6_months',
    label: '6 derniers mois',
    getRange: () => ({
      from: startOfMonth(subMonths(new Date(), 5)),
      to: new Date(),
    }),
  },
  {
    key: 'this_year',
    label: 'Cette annee',
    getRange: () => ({
      from: startOfYear(new Date()),
      to: new Date(),
    }),
  },
]

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [selectedPreset, setSelectedPreset] = React.useState<PresetKey>('this_month')
  const [isCustomOpen, setIsCustomOpen] = React.useState(false)
  const [customRange, setCustomRange] = React.useState<{ from?: Date; to?: Date }>({})

  // Initialize with default preset
  React.useEffect(() => {
    if (!value) {
      const defaultPreset = presets.find(p => p.key === 'this_month')
      if (defaultPreset) {
        onChange(defaultPreset.getRange())
      }
    }
  }, [])

  const handlePresetChange = (presetKey: string) => {
    if (presetKey === 'custom') {
      setSelectedPreset('custom')
      setIsCustomOpen(true)
    } else {
      const preset = presets.find(p => p.key === presetKey)
      if (preset) {
        setSelectedPreset(preset.key)
        onChange(preset.getRange())
        setIsCustomOpen(false)
      }
    }
  }

  const handleCustomDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range) {
      setCustomRange(range)
      if (range.from && range.to) {
        onChange({ from: range.from, to: range.to })
      }
    }
  }

  const formatDateRange = () => {
    if (!value) return 'Selectionner une periode'

    if (selectedPreset !== 'custom') {
      const preset = presets.find(p => p.key === selectedPreset)
      if (preset) return preset.label
    }

    return `${format(value.from, 'dd MMM yyyy', { locale: fr })} - ${format(value.to, 'dd MMM yyyy', { locale: fr })}`
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select value={selectedPreset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px] bg-card">
          <SelectValue>{formatDateRange()}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset.key} value={preset.key}>
              {preset.label}
            </SelectItem>
          ))}
          <SelectItem value="custom">Personnalise...</SelectItem>
        </SelectContent>
      </Select>

      {selectedPreset === 'custom' && (
        <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'justify-start text-left font-normal bg-card',
                !customRange.from && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {customRange.from ? (
                customRange.to ? (
                  <>
                    {format(customRange.from, 'dd/MM/yyyy')} - {format(customRange.to, 'dd/MM/yyyy')}
                  </>
                ) : (
                  format(customRange.from, 'dd/MM/yyyy')
                )
              ) : (
                'Choisir les dates'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={customRange.from}
              selected={customRange.from && customRange.to ? { from: customRange.from, to: customRange.to } : undefined}
              onSelect={handleCustomDateSelect}
              numberOfMonths={2}
              locale={fr}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}

// Utility function to format dates for URL params
export function formatDateForUrl(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

// Utility function to parse dates from URL params
export function parseDateFromUrl(dateStr: string): Date | null {
  if (!dateStr) return null
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date
}

// Get default date range (this month)
export function getDefaultDateRange(): DateRange {
  return {
    from: startOfMonth(new Date()),
    to: new Date(),
  }
}
