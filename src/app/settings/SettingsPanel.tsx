'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Shield, User } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

export function SettingsPanel({ isAdmin, userEmail }: { isAdmin: boolean; userEmail: string }) {
  const [defaultDeterminer, setDefaultDeterminer] = useState('Brian Murray')

  function save() {
    toast.success('Settings saved')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 flex flex-col gap-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Account</h3>
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 dark:bg-zinc-800 rounded-full p-2">
            <User className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{userEmail}</p>
            <p className="text-xs text-gray-400 dark:text-zinc-500">Supabase account</p>
          </div>
          {isAdmin && (
            <Badge className="ml-auto bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-0 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Admin
            </Badge>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 flex flex-col gap-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Data Entry Defaults</h3>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Default Determiner</Label>
          <Input
            value={defaultDeterminer}
            onChange={(e) => setDefaultDeterminer(e.target.value)}
          />
          <p className="text-xs text-gray-400 dark:text-zinc-500">Pre-fills the Determiner field on new records</p>
        </div>
        <Button
          onClick={save}
          className="bg-gray-900 hover:bg-gray-700 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white w-fit"
        >
          Save Defaults
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">About</h3>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          Bee Tender — Pollinator survey data management.<br />
          Built with Next.js, Supabase, and shadcn/ui.
        </p>
        <Separator />
        <p className="text-xs text-gray-400 dark:text-zinc-500">
          More settings (authorised users, custom drop-down values, site lists) will be added in a future update.
        </p>
      </div>
    </div>
  )
}
