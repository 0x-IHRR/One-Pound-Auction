'use client';

import { useState } from 'react';

import type { ApiFailure, ApiSuccess } from '@/shared/http';
import { getApiErrorMessage } from '@/shared/utils/get-api-error-message';

export default function AdminUnlistButton({
    boxId,
    disabled,
}: {
    boxId: string;
    disabled: boolean;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClick = async () => {
        if (disabled || isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/admin/boxes/${boxId}/unlist`, {
                method: 'POST',
            });
            const payload = (await response.json()) as ApiSuccess<unknown> | ApiFailure;

            if (!response.ok || !payload.success) {
                throw new Error(getApiErrorMessage(payload, '下架失败，请稍后重试。'));
            }

            window.location.reload();
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : '下架失败，请稍后重试。');
            setIsSubmitting(false);
        }
    };

    return (
        <button
            type="button"
            disabled={disabled || isSubmitting}
            onClick={handleClick}
            className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-200 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {isSubmitting ? '处理中...' : disabled ? '不可下架' : '下架内容'}
        </button>
    );
}
