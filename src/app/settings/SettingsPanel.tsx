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
    // In a future iteration this will persist to a settings table
    toast.success('Settings saved')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Account */}
      <div className="bg-white rounded-2xl border border-amber-100 p-5 flex flex-col gap-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-700">Account</h3>
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 rounded-full p-2">
            <User className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{userEmail}</p>
            <p className="text-xs text-gray-400">Google account</p>
          </div>
          {isAdmin && (
            <Badge className="ml-auto bg-amber-100 text-amber-800 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Admin
            </Badge>
          )}
        </div>
      </div>

      {/* Defaults */}
      <div className="bg-white rounded-2xl border border-amber-100 p-5 flex flex-col gap-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-700">Data Entry Defaults</h3>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium text-gray-700">Default Determiner</Label>
          <Input
            value={defaultDeterminer}
            onChange={(e) => setDefaultDeterminer(e.target.value)}
          />
          <p className="text-xs text-gray-400">Pre-fills the Determiner field on new records</p>
        </div>
        <Button onClick={save} className="bg-amber-500 hover:bg-amber-600 text-white w-fit">
          Save Defaults
        </Button>
      </div>

      {/* Info */}
      <div className="bg-white rounded-2xl border border-amber-100 p-5 flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-700">About</h3>
        <p className="text-sm text-gray-500">
          Bee Tender — Pollinator survey data management.<br />
          Built with Next.js, Supabase, and shadcn/ui.
        </p>
        <Separator />
        <p className="text-xs text-gray-400">
          More settings (authorised users, custom drop-down values, site lists) will be added in a future update.
        </p>
      </div>
    </div>
  )
}
