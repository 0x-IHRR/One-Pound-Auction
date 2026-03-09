import type { MarketplaceContentStatus } from '../../features/marketplace/types';

const badgeStyles: Record<MarketplaceContentStatus, string> = {
    DRAFT: 'border-white/10 bg-white/5 text-slate-300',
    PUBLISHED: 'border-[#00d4aa]/30 bg-[#00d4aa]/10 text-[#00d4aa]',
    UNLISTED: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    DELETED: 'border-red-500/30 bg-red-500/10 text-red-300',
};

const badgeLabels: Record<MarketplaceContentStatus, string> = {
    DRAFT: '草稿',
    PUBLISHED: '已发布',
    UNLISTED: '已下架',
    DELETED: '已删除',
};

export default function StatusBadge({ status }: { status: MarketplaceContentStatus }) {
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${badgeStyles[status]}`}>
            {badgeLabels[status]}
        </span>
    );
}
