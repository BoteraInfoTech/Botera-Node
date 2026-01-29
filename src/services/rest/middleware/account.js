import MongoDB from '../../../mongoDB';
import * as accountQueries from '../../../mongoDB/queries/account';

/**
 * Loads existing accounts for this owner by pageIds from req.body.accounts.
 * Attaches req.existingAccountsByPageId = Map(pageId -> doc) for connectAccount to upsert.
 */
export const connectAccountResolveExisting = async (req, res, next) => {
  try {
    const { accounts = [] } = req.body || {};
    const { userId } = req.userData || {};
    if (!userId || !Array.isArray(accounts) || !accounts.length) {
      req.existingAccountsByPageId = new Map();
      return next();
    }
    const pageIds = accounts.map((a) => a.pageId).filter(Boolean);
    if (!pageIds.length) {
      req.existingAccountsByPageId = new Map();
      return next();
    }
    const existing = await accountQueries.findAccountsByPageIdsAndOwner(
      MongoDB,
      userId,
      pageIds
    );
    req.existingAccountsByPageId = new Map(
      existing.map((a) => [String(a.pageId), a])
    );
    next();
  } catch (e) {
    next(e);
  }
};
