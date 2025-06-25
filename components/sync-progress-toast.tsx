"use client";
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useSyncQueue } from '@/hooks/use-sync-queue'

const SyncProgressToast = () => {
    const { isSyncing, currentSync } = useSyncQueue()

    useEffect(() => {
        if (isSyncing && currentSync) {
            toast.loading(`Sincronizando: ${currentSync.label}`, {
                id: 'sync-progress',
                position: 'top-right',
                duration: Infinity,
            })
        } else {
            toast.dismiss('sync-progress')
        }
        return () => {
            toast.dismiss('sync-progress')
        }
    }, [isSyncing, currentSync])

    return null
}

export default SyncProgressToast 