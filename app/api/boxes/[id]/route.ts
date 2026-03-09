import { createBoxDetailRouteHandlers } from '../../../../features/marketplace/handlers';

const handlers = createBoxDetailRouteHandlers();

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
