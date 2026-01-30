import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosFetcher from 'services/axios/axiosFetcher';

const ACCOUNTS_API = '/api/crm/accounts';

// Fetch all accounts for user's organizations
export const useAccounts = () => {
  const { data, error, isLoading, mutate } = useSWR(
    ACCOUNTS_API,
    axiosFetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    accounts: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
};

// Fetch single account by ID
export const useAccount = (accountId) => {
  const { data, error, isLoading, mutate } = useSWR(
    accountId ? `${ACCOUNTS_API}/${accountId}` : null,
    axiosFetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    account: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
};

// Create account mutation
export const useCreateAccount = () => {
  const mutation = useSWRMutation(
    [ACCOUNTS_API, { method: 'post' }],
    axiosFetcher
  );

  return mutation;
};

// Update account mutation
export const useUpdateAccount = (accountId) => {
  const mutation = useSWRMutation(
    accountId ? [`${ACCOUNTS_API}/${accountId}`, { method: 'patch' }] : null,
    axiosFetcher
  );

  return mutation;
};

// Delete account mutation
export const useDeleteAccount = (accountId) => {
  const mutation = useSWRMutation(
    accountId ? [`${ACCOUNTS_API}/${accountId}`, { method: 'delete' }] : null,
    axiosFetcher
  );

  return mutation;
};
