import React from "react";

export interface PaginationState {
  page: number;
  limit: number;
  totalCount: number;
  hasNextPage: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
}

export interface UsePaginationOptions {
  initialLimit?: number;
  scrollThreshold?: number;
}

/**
 * Advanced pagination hook with scroll-based infinite loading
 * Manages pagination state and provides scroll detection utilities
 */
export const usePagination = (options: UsePaginationOptions = {}) => {
  const { initialLimit = 20, scrollThreshold = 100 } = options;
  
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [state, setState] = React.useState<PaginationState>({
    page: 1,
    limit: initialLimit,
    totalCount: 0,
    hasNextPage: false,
    isLoading: false,
    isLoadingMore: false,
    error: null,
  });

  const resetPagination = React.useCallback(() => {
    setState({
      page: 1,
      limit: initialLimit,
      totalCount: 0,
      hasNextPage: false,
      isLoading: false,
      isLoadingMore: false,
      error: null,
    });
  }, [initialLimit]);

  const setLoading = React.useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }));
  }, []);

  const setLoadingMore = React.useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, isLoadingMore: loading }));
  }, []);

  const setError = React.useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const updatePaginationData = React.useCallback(
    (data: { totalCount: number; hasNextPage: boolean; reset?: boolean }) => {
      setState((prev) => ({
        ...prev,
        totalCount: data.totalCount,
        hasNextPage: data.hasNextPage,
        page: data.reset ? 1 : prev.page,
      }));
    },
    []
  );

  const nextPage = React.useCallback(() => {
    setState((prev) => ({
      ...prev,
      page: prev.page + 1,
      isLoadingMore: true,
    }));
  }, []);

  const prevPage = React.useCallback(() => {
    setState((prev) => ({
      ...prev,
      page: Math.max(prev.page - 1, 1),
    }));
  }, []);

  /**
   * Detect if user scrolled near the bottom
   * @param threshold - Distance from bottom in pixels to trigger loading
   * @returns true if should load more
   */
  const handleScroll = React.useCallback(
    (threshold = scrollThreshold): boolean => {
      const container = scrollContainerRef.current;
      if (!container) return false;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      const shouldLoadMore =
        distanceFromBottom < threshold &&
        state.hasNextPage &&
        !state.isLoadingMore &&
        !state.isLoading;

      return shouldLoadMore;
    },
    [state.hasNextPage, state.isLoadingMore, state.isLoading, scrollThreshold]
  );

  /**
   * Setup scroll listener
   */
  const setupScrollListener = React.useCallback(
    (onLoadMore: () => void, threshold = scrollThreshold) => {
      const container = scrollContainerRef.current;
      if (!container) return () => {};

      const handleScroll = () => {
        if (handleScroll(threshold)) {
          onLoadMore();
        }
      };

      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    },
    [scrollThreshold, handleScroll]
  );

  return {
    state,
    scrollContainerRef,
    resetPagination,
    setLoading,
    setLoadingMore,
    setError,
    updatePaginationData,
    nextPage,
    prevPage,
    handleScroll,
    setupScrollListener,
  };
};
