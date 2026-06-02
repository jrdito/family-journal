'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import ConfirmModal from '@/components/ui/ConfirmModal'

export default function DeleteJournalButton({ journalId }: { journalId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)

  async function handleDelete() {
    const { error } = await supabase.from('family_journals').delete().eq('id', journalId)
    if (error) {
      toast.error('Failed to delete')
    } else {
      toast.success('Entry deleted')
      router.push('/journals')
      router.refresh()
    }
    setOpen(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-danger text-xs py-2">
        <Trash2 className="w-3.5 h-3.5" />Delete
      </button>
      <ConfirmModal
        open={open}
        title="Delete Entry"
        message="This will permanently delete this entry and all its photos. This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
