import { err } from '../error';
import MongoDB from '../../../mongoDB';
import * as accountQueries from '../../../mongoDB/queries/account';

const setData = (req, data) => {
  if (req.validData) {
    Object.assign(req.validData, {
      ...data,
    });
  } else {
    req.validData = { ...data };
  }
};

export const isValidSearchQuery = (req, haveError) => {
  if (haveError) return null;

  let { q } = req.query || {};

  if (q === undefined || q === null || q === '') return null;

  if (typeof q !== 'string') {
    return err('Invalid search query', 'q');
  }

  q = q.trim();

  if (!q) return null;

  if (q.length > 100) {
    return err('Search query is too long', 'q');
  }

  // Allow basic word characters, spaces and a few safe symbols.
  // This prevents obviously dangerous characters from being used.
  const unsafePattern = /[<>;$]/;
  if (unsafePattern.test(q)) {
    return err('Search query contains invalid characters', 'q');
  }

  setData(req, { q });
  return null;
};

export const isValidAccount = async (req, haveError) => {
  if (haveError) return null;

  const { userData } = req || {};
  const { userId } = userData || {};

  if (!userId) {
    return err('Invalid user', 'userId');
  }

  const deleteAll = String(req.query?.deleteAll || '').toLowerCase() === 'true';

  const { id } = req.params || {};
  let { accountIds = [] } = req.body || {};

  if (deleteAll) {
    if (id && id !== '1') {
      return err(
        'deleteAll cannot be used together with specific account ids',
        'deleteAll'
      );
    }
    setData(req, { deleteAll: true });
    return null;
  }

  const ids = [];

  if (id && id !== '1') {
    ids.push(id);
  }

  if (Array.isArray(accountIds)) {
    ids.push(...accountIds);
  }

  const normalizedIds = Array.from(
    new Set(
      ids
        .filter((val) => typeof val === 'string' || typeof val === 'number')
        .map((val) => String(val).trim())
        .filter((val) => val)
    )
  );

  if (!normalizedIds.length) {
    return err('No account specified to delete', 'accountIds');
  }

  if (normalizedIds.some((val) => val.length > 100)) {
    return err('One or more account ids are invalid', 'accountIds');
  }

  const existingAccounts = await accountQueries.findAccountsByPageIdsAndOwner(
    MongoDB,
    userId,
    normalizedIds
  );

  if (!existingAccounts.length) {
    return err('No matching accounts found for this user', 'accountIds');
  }

  const existingPageIds = new Set(
    existingAccounts.map((acc) => String(acc.pageId))
  );

  const notOwned = normalizedIds.filter(
    (accountId) => !existingPageIds.has(String(accountId))
  );

  if (notOwned.length) {
    return {
      ...err('One or more accounts do not belong to this user', 'accountIds'),
      invalidIds: notOwned,
    };
  }

  setData(req, { accountIds: normalizedIds });
  return null;
};
