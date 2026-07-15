'use client';

import { useState } from 'react';

import type { MarketplaceProblemStatus } from '@/features/marketplace/types/box';
import type { ApiFailure, ApiSuccess } from '@/shared/http';
import { getApiErrorMessage } from '@/shared/utils/get-api-error-message';

const statusOptions: Array<{ value: MarketplaceProblemStatus; label: string }> = [
    { value: 'OPEN', label: '待处理' },
    { value: 'IN_PROGRESS', label: '处理中' },
    { value: 'SOLVED', label: '已解决' },
];

export default function AdminProblemStatusControl({
    boxId,
    value,
}: {
    boxId: string;
    value: MarketplaceProblemStatus;
}) {
    const [currentValue, setCurrentValue] = useState(value);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateStatus = async (problemStatus: MarketplaceProblemStatus) => {
        setCurrentValue(problemStatus);
        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/admin/boxes/${boxId}/problem-status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ problemStatus }),
            });
            const payload = (await response.json()) as ApiSuccess<unknown> | ApiFailure;

            if (!response.ok || !payload.success) {
                throw new Error(getApiErrorMessage(payload, '更新问题状态失败。'));
            }

            window.location.reload();
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : '更新问题状态失败。');
            setCurrentValue(value);
            setIsSubmitting(false);
        }
    };

    return (
        <label className="grid gap-2 text-xs text-slate-400">
            <span>问题状态</span>
            <select
                value={currentValue}
                disabled={isSubmitting}
                onChange={(event) => void updateStatus(event.target.value as MarketplaceProblemStatus)}
                className="rounded-full border border-white/10 bg-[#0d1220] px-3 py-2 text-sm font-medium text-slate-100 outline-none transition focus:border-[#00d4aa]/40 disabled:opacity-60"
            >
                {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}
