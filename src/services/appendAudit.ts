import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuditLog } from '../types';

export async function appendOwnAuditLogs(
  client: SupabaseClient,
  logs: AuditLog[]
): Promise<void> {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    throw new Error('Cần đăng nhập để ghi nhật ký.');
  }

  for (const log of logs) {
    if (log.user_id !== data.user.id) continue;

    const { error: writeError } = await client.rpc(
      'append_audit_event',
      {
        p_event: {
          id: log.id,
          hanh_dong: log.hanh_dong,
          doi_tuong: log.doi_tuong,
          noi_dung_thay_doi: log.noi_dung_thay_doi,
        },
      }
    );

    if (writeError) throw new Error(writeError.message);
  }
}
