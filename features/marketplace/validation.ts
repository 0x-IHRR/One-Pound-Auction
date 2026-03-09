import {
    MARKETPLACE_CONTENT_STATUSES,
    MARKETPLACE_ITEM_TYPES,
    type CreateMarketplaceContentInput,
    type ListMarketplaceContentQuery,
    type MarketplaceContentStatus,
    type MarketplaceItemType,
    type UpdateMarketplaceContentInput,
} from './types.ts';

type ParseSuccess<T> = { success: true; data: T };
type ParseFailure = { success: false; error: string; statusCode: number };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanText(value: unknown) {
    return typeof value === 'string' ? value.trim() : '';
}

function parseItemType(value: unknown) {
    const nextValue = cleanText(value).toUpperCase();

    if (!nextValue) {
        return undefined;
    }

    if (MARKETPLACE_ITEM_TYPES.includes(nextValue as MarketplaceItemType)) {
        return nextValue as MarketplaceItemType;
    }

    return null;
}

function parseStatus(value: unknown) {
    const nextValue = cleanText(value).toUpperCase();

    if (!nextValue) {
        return undefined;
    }

    if (MARKETPLACE_CONTENT_STATUSES.includes(nextValue as MarketplaceContentStatus)) {
        return nextValue as MarketplaceContentStatus;
    }

    return null;
}

function parsePrice(value: unknown) {
    if (value === undefined || value === null || value === '') {
        return 1;
    }

    const nextValue = Number(value);

    if (!Number.isFinite(nextValue) || nextValue <= 0) {
        return null;
    }

    return Number(nextValue.toFixed(2));
}

export function parseCreateMarketplaceContentInput(payload: unknown): ParseSuccess<CreateMarketplaceContentInput> | ParseFailure {
    if (!payload || typeof payload !== 'object') {
        return { success: false, error: '请求体格式不正确。', statusCode: 400 };
    }

    const record = payload as Record<string, unknown>;
    const parsedItemType = parseItemType(record.itemType);
    const parsedStatus = parseStatus(record.status);
    const itemType = parsedItemType ?? 'OFFER';
    const status = parsedStatus ?? 'PUBLISHED';
    const title = cleanText(record.title);
    const hookDescription = cleanText(record.hook_description);
    const hiddenContent = cleanText(record.hidden_content);
    const price = parsePrice(record.price);
    const acceptsBarter = Boolean(record.accepts_barter);
    const barterDemand = cleanText(record.barter_demand);

    if (parsedItemType === null) {
        return { success: false, error: 'itemType 只支持 OFFER 或 WISH。', statusCode: 400 };
    }

    if (parsedStatus === null) {
        return { success: false, error: 'status 非法。', statusCode: 400 };
    }

    if (status !== 'DRAFT' && status !== 'PUBLISHED') {
        return { success: false, error: '新建内容只能保存为草稿或直接发布。', statusCode: 400 };
    }

    if (!title || title.length > 80) {
        return { success: false, error: '标题长度需在 1 到 80 个字符之间。', statusCode: 400 };
    }

    if (!hookDescription || hookDescription.length > 200) {
        return { success: false, error: '摘要长度需在 1 到 200 个字符之间。', statusCode: 400 };
    }

    if (!hiddenContent || hiddenContent.length > 5000) {
        return { success: false, error: '隐藏内容长度需在 1 到 5000 个字符之间。', statusCode: 400 };
    }

    if (price === null) {
        return { success: false, error: '价格必须是大于 0 的数字。', statusCode: 400 };
    }

    if (acceptsBarter && !barterDemand) {
        return { success: false, error: '开启交换后必须填写交换诉求。', statusCode: 400 };
    }

    return {
        success: true,
        data: {
            itemType,
            status,
            title,
            hook_description: hookDescription,
            hidden_content: hiddenContent,
            price,
            accepts_barter: acceptsBarter,
            barter_demand: acceptsBarter ? barterDemand : null,
        },
    };
}

export function parseUpdateMarketplaceContentInput(payload: unknown): ParseSuccess<UpdateMarketplaceContentInput> | ParseFailure {
    if (!payload || typeof payload !== 'object') {
        return { success: false, error: '请求体格式不正确。', statusCode: 400 };
    }

    const record = payload as Record<string, unknown>;
    const nextData: UpdateMarketplaceContentInput = {};

    if ('itemType' in record) {
        const itemType = parseItemType(record.itemType);

        if (!itemType) {
            return { success: false, error: 'itemType 只支持 OFFER 或 WISH。', statusCode: 400 };
        }

        nextData.itemType = itemType;
    }

    if ('title' in record) {
        const title = cleanText(record.title);

        if (!title || title.length > 80) {
            return { success: false, error: '标题长度需在 1 到 80 个字符之间。', statusCode: 400 };
        }

        nextData.title = title;
    }

    if ('hook_description' in record) {
        const hookDescription = cleanText(record.hook_description);

        if (!hookDescription || hookDescription.length > 200) {
            return { success: false, error: '摘要长度需在 1 到 200 个字符之间。', statusCode: 400 };
        }

        nextData.hook_description = hookDescription;
    }

    if ('hidden_content' in record) {
        const hiddenContent = cleanText(record.hidden_content);

        if (!hiddenContent || hiddenContent.length > 5000) {
            return { success: false, error: '隐藏内容长度需在 1 到 5000 个字符之间。', statusCode: 400 };
        }

        nextData.hidden_content = hiddenContent;
    }

    if ('price' in record) {
        const price = parsePrice(record.price);

        if (price === null) {
            return { success: false, error: '价格必须是大于 0 的数字。', statusCode: 400 };
        }

        nextData.price = price;
    }

    if ('accepts_barter' in record) {
        nextData.accepts_barter = Boolean(record.accepts_barter);
    }

    if ('barter_demand' in record) {
        nextData.barter_demand = cleanText(record.barter_demand) || null;
    }

    if (
        nextData.accepts_barter === true &&
        !nextData.barter_demand &&
        !cleanText(record.barter_demand)
    ) {
        return { success: false, error: '开启交换后必须填写交换诉求。', statusCode: 400 };
    }

    if (Object.keys(nextData).length === 0) {
        return { success: false, error: '至少传入一个可更新字段。', statusCode: 400 };
    }

    return { success: true, data: nextData };
}

export function parseListMarketplaceContentQuery(searchParams: URLSearchParams): ParseSuccess<ListMarketplaceContentQuery> | ParseFailure {
    const itemType = parseItemType(searchParams.get('itemType'));
    const status = parseStatus(searchParams.get('status'));
    const q = cleanText(searchParams.get('q'));
    const authorEmail = cleanText(searchParams.get('authorEmail')).toLowerCase();

    if (itemType === null) {
        return { success: false, error: 'itemType 只支持 OFFER 或 WISH。', statusCode: 400 };
    }

    if (status === null) {
        return { success: false, error: 'status 非法。', statusCode: 400 };
    }

    if (q.length > 80) {
        return { success: false, error: '搜索关键词最长 80 个字符。', statusCode: 400 };
    }

    if (authorEmail && !emailPattern.test(authorEmail)) {
        return { success: false, error: 'authorEmail 格式不正确。', statusCode: 400 };
    }

    return {
        success: true,
        data: {
            itemType: itemType ?? undefined,
            q: q || undefined,
            status: status ?? undefined,
            authorEmail: authorEmail || undefined,
        },
    };
}
